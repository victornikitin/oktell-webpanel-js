class List

	constructor: (oktell, panelEl, dropdownEl, afterOktellConnect, debugMode) ->
		@allActions =
			call: { icon: '/img/icons/action/call.png', iconWhite: '/img/icons/action/white/call.png', text: @langs.call }
			conference : { icon: '/img/icons/action/confinvite.png', iconWhite: '/img/icons/action/white/confinvite.png', text: @langs.conference }
			transfer : { icon: '/img/icons/action/transfer.png', text: @langs.transfer }
			toggle : { icon: '/img/icons/action/toggle.png', text: @langs.toggle }
			intercom : { icon: '/img/icons/action/intercom.png', text: @langs.intercom }
			endCall : { icon: '/img/icons/action/endcall.png', iconWhite: '/img/icons/action/white/endcall.png', text: @langs.endCall }
			ghostListen : { icon: '/img/icons/action/ghost_monitor.png', text: @langs.ghostListen }
			ghostHelp : { icon: '/img/icons/action/ghost_help.png', text: @langs.ghostHelp }

		@actionCssPrefix = 'i_'
		@lastDropdownUser = false

		@userWithGeneratedButtons = {}

		@debugMode = debugMode

		@dropdownPaddingBottomLeft = 3
		@dropdownOpenedOnPanel = false

		@regexps =
			actionText: /\{\{actionText\}\}/
			action: /\{\{action\}\}/
			css: /\{\{css\}\}/

		oktellConnected = false
		@usersByNumber = {}
		@me = false
		@panelUsers = []
		@panelUsersFiltered = []
		@abonents = {}
		@hold = {}
		@oktell = oktell
		CUser.prototype.oktell = oktell
		@filter = false
		@panelEl = panelEl
		@dropdownEl = dropdownEl
		@dropdownElLiTemplate = @dropdownEl.html()
		@dropdownEl.empty()
		@keypadEl = @panelEl.find '.j_phone_keypad'
		@keypadIsVisible = false
		@usersListBlockEl = @panelEl.find '.j_main_list'
		@usersListEl = @usersListBlockEl.find 'tbody'
		@abonentsListBlock = @panelEl.find '.j_abonents'
		@abonentsListEl = @abonentsListBlock.find 'tbody'
		@holdBlockEl = @panelEl.find '.j_hold'
		@holdListEl = @holdBlockEl.find 'tbody'
		@queueBlockEl = @panelEl.find '.j_queue'
		@queueListEl = @queueBlockEl.find 'tbody'
		@filterInput = @panelEl.find 'input'
		@filterClearCross = @panelEl.find '.jInputClear_close'
		debouncedSetFilter = false

		@jScroll @usersListBlockEl

		@filterClearCross.bind 'click', =>
			@clearFilter()

		@filterInput.bind 'keyup', (e)=>
			if not debouncedSetFilter
				debouncedSetFilter = debounce =>
					@setFilter @filterInput.val()
				, 100

			if @filterInput.val()
				@filterClearCross.show()
			else
				@filterClearCross.hide()

			if e.keyCode is 13
				@filterInput.blur()
				setTimeout =>
					user = @panelUsersFiltered[0]
					user.doLastFirstAction()
					@clearFilter()
				, 50
			else
				debouncedSetFilter()
			return true

		@panelEl.on 'mouseenter', '.b_contact', ->
			$(this).data('user')?.isHovered true
		@panelEl.on 'mouseleave', '.b_contact', ->
			$(this).data('user')?.isHovered false

		@panelEl.on 'click', '.b_contact .drop_down', (e)=>
			dropdown = $(e.currentTarget)
			user = dropdown.closest('.b_button_action').data('user')
			if user
				@showDropdown user, dropdown.closest('.b_button_action'), user.loadOktellActions(), true

		@dropdownEl.on 'click', '[data-action]', (e) =>
			actionEl = $(e.currentTarget)
			action = actionEl.data 'action'
			user = @dropdownEl.data('user')
			if action and user
				user.doAction action
			@dropdownEl.hide()

		dropdownHideTimer = ''
		@dropdownEl.hover =>
			clearTimeout dropdownHideTimer
		, =>
			dropdownHideTimer = setTimeout =>
				@dropdownEl.fadeOut 150, =>
					@dropdownOpenedOnPanel = false

			, 500

		@panelEl.find('.j_keypad_expand').bind 'click', =>
			@toggleKeypadVisibility()
			@filterInput.focus()

		@keypadEl.find('li').bind 'click', (e) =>
			@filterInput.focus()
			@filterInput.val( @filterInput.val() + $(e.currentTarget).find('button').data('num') )
			@filterInput.keydown()

		oktell.on 'disconnect', =>
			oktellConnected = false

		oktell.on 'connect', =>
			oktellConnected = true
			oInfo = oktell.getMyInfo()
			oInfo.userid = oInfo.userid.toString().toLowerCase()
			@myNumber = oInfo.number?.toString()
			CUser.prototype.defaultAvatar = oInfo.defaultAvatar
			CUser.prototype.defaultAvatar32 = oInfo.defaultAvatar32x32
			CUser.prototype.defaultAvatar64 = oInfo.defaultAvatar64x64

			oUsers = oktell.getUsers()
			for oId, oUser of oUsers
				user = new CUser oUser
				if user.number
					@usersByNumber[user.number] = user
				if user.id isnt oInfo.userid
					@panelUsers.push user
				else
					@me = user

			@sortPanelUsers @panelUsers

			oktell.on 'stateChange', ( newState, oldState ) =>
				@reloadActions()

			oktell.onNativeEvent 'pbxnumberstatechanged', (data) =>
				for n in data.numbers
					numStr = n.num.toString()
					@usersByNumber[numStr]?.setState n.numstateid

			oktell.on 'abonentsChange', ( abonents ) =>
				@setAbonents abonents

			oktell.on 'holdStateChange', ( holdInfo ) =>
				#log 'Oktell holdStateChange', holdInfo
				@setHold holdInfo

			@setAbonents oktell.getAbonents()
			@setHold oktell.getHoldInfo()

			@setFilter ''

			setInterval =>
				if oktellConnected
					oktell.getQueue (data)=>
						if data.result
							@setQueue data.queue
			, if debugMode then 999999999 else 5000

			if typeof afterOktellConnect is 'function' then afterOktellConnect()

	getUserButtonForPlagin: (phone) ->
		user = @getUser phone
		@userWithGeneratedButtons[phone] = user
		button = user.getButtonEl()
		button.find('.drop_down').bind 'click', =>
			@showDropdown user, button, user.loadOktellActions()
		return button

	clearFilter: ->
		@filterInput.val ''
		@setFilter ''
		@filterInput.keyup()

	toggleKeypadVisibility: ->
		@setKeypadVisibility not @keypadIsVisible

	setKeypadVisibility: (visible) ->
		if visible? and Boolean(@keypadIsVisible) isnt Boolean(visible)
			@keypadIsVisible = Boolean(visible)
			@keypadEl.stop true, true
			if @keypadIsVisible
				@keypadEl.slideDown 200
			else
				@keypadEl.slideUp 200

	addEventListenersForButton: (user, button) ->
		button.bind 'click', =>
			user
			if user
				@showDropdown user, $(this)

	showDropdown: ( user, buttonEl, actions, onPanel ) ->
		t = @dropdownElLiTemplate
		@dropdownEl.empty()

		if actions?.length
			aEls = []
			for a in actions
				if typeof a is 'string' and @allActions[a]?.text
					aEls.push t.replace( @regexps.actionText, @allActions[a].text).replace( @regexps.action, a).replace( @regexps.css, @actionCssPrefix + a.toLowerCase() )

			if aEls.length

				@dropdownEl.append aEls

				@dropdownEl.children('li:first').addClass 'g_first'
				@dropdownEl.children('li:last').addClass 'g_last'

				@dropdownEl.data 'user', user

				@dropdownEl.css
					'top': if @dropdownEl.height() + buttonEl.offset().top > $(window).height() then $(window).height() - @dropdownEl.height() - @dropdownPaddingBottomLeft else buttonEl.offset().top,
					'left': Math.max @dropdownPaddingBottomLeft, buttonEl.offset().left - @dropdownEl.width() + buttonEl.width()
					'visibility': 'visible'
				@dropdownEl.fadeIn(100)
				@dropdownOpenedOnPanel = true if onPanel
			else
				@dropdownEl.hide()
		else
			@dropdownEl.hide()

	logUsers: ->
		for k,u of @panelUsersFiltered
			log u.getInfo()

	syncAbonentsAndUserlist: (abonents, userlist) ->
		absByNumber = {}
		$.each abonents, (i, ab) =>
			number = ab.phone.toString() or ''
			if not number then return
			absByNumber[number] = ab
			if not userlist[ab.phone.toString()]
				u = @getUser
					name: ab.name
					number: ab.phone
					id: ab.userid
					state: 5
				userlist[u.number] = u

		for uNumber, user of userlist
			if not absByNumber[user.number]
				delete userlist[user.number]

	setAbonents: (abonents) ->
		@syncAbonentsAndUserlist abonents, @abonents
		@setAbonentsHtml()

	setQueue: (queue) ->
		@syncAbonentsAndUserlist queue, @queue
		@setQueueHtml()

	setHold: (holdInfo) ->
		abs = []
		if holdInfo.hasHold
			abs = [holdInfo]
		@syncAbonentsAndUserlist abs, @hold
		@setHoldHtml()

	setPanelUsersHtml: (usersArray) ->
		@_setUsersHtml usersArray, @usersListEl

	setAbonentsHtml: ->
		@_setActivityPanelUserHtml @abonents, @abonentsListEl, @abonentsListBlock

	setHoldHtml: ->
		@_setActivityPanelUserHtml @hold, @holdListEl, @holdBlockEl

	setQueueHtml: ->
		@_setActivityPanelUserHtml @queue, @queueListEl, @queueBlockEl

	_setActivityPanelUserHtml: (users, listEl, blockEl) ->
		usersArray = []
		usersArray.push(u) for k,u of users
		@_setUsersHtml usersArray, listEl
		if usersArray.length and blockEl.is(':not(:visible)')
			blockEl.slideDown 200
		else if usersArray.length is 0 and blockEl.is(':visible')
			blockEl.slideUp 200


	_setUsersHtml: (usersArray, $el) ->
		html = []
		for u in usersArray
			#log 'render ' + u.getInfo()
			html.push u.getEl()
		$el.html html

	sortPanelUsers: ( usersArray ) ->
		usersArray.sort (a,b) ->
			if a.number and not b.number
				-1
			else if not a.number and b.number
				1
			else
				if a.state and not b.state
					-1
				else if not a.state and b.state
					1
				else
					if a.name > b.name
						1
					else if a.name < b.name
						-1

	setFilter: (filter) ->
		if @filter is filter then return false
		oldFilter = @filter
		@filter = filter
#		if @filterInput.val() isnt @filter
#			@filterInput.val @filter
		if filter is ''
			@panelUsersFiltered = [].concat @panelUsers
			@afterSetFilter(@panelUsersFiltered)
			return @panelUsersFiltered
		filteredUsers = []
		exactMatch = false

		if oldFilter.indexOf(@filter) is 0
			forFilter = @panelUsersFiltered
		else
			forFilter = @panelUsers

		for u in @panelUsers
			if u.isFiltered filter
				filteredUsers.push u
				if u.number is filter and not exactMatch
					exactMatch = u
		@panelUsersFiltered = if not exactMatch then [@getUser({name:filter, number: filter}, true)].concat(filteredUsers) else filteredUsers
		@afterSetFilter(@panelUsersFiltered)
		@panelUsersFiltered

	afterSetFilter: (filteredUsersArray) ->
		@setPanelUsersHtml filteredUsersArray

	getUser: (data, dontRemember) ->
		if typeof data is 'string' or typeof data is 'number'
			strNumber = data.toString()
		else
			strNumber = data.number.toString()

		if @usersByNumber[strNumber]
			return @usersByNumber[strNumber]

		fantom = new CUser
			number: strNumber
			name: data.name
			isFantom: true
			state: ( if data?.state? then data.state else 5 )

		if not dontRemember
			@usersByNumber[strNumber] = fantom
		fantom

	reloadActions: ->
		setTimeout =>
			for phone, user of @userWithGeneratedButtons
				actions = user.loadActions()
				log 'reload actions for ' + user.getInfo() + ' ' + actions
		, 100