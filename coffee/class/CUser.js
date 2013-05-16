// Generated by CoffeeScript 1.6.2
var CUser,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

CUser = (function() {
  CUser.prototype.logGroup = 'User';

  function CUser(data) {
    this.doAction = __bind(this.doAction, this);    this.state = false;
    this.hasHover = false;
    this.buttonLastAction = '';
    this.firstLiCssPrefix = 'm_button_action_';
    this.els = $();
    this.buttonEls = $();
    this.init(data);
  }

  CUser.prototype.init = function(data) {
    var lastHtml, ns, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;

    this.id = (_ref = data.id) != null ? _ref.toString().toLowerCase() : void 0;
    this.isFantom = data.isFantom || false;
    this.number = ((_ref1 = data.number) != null ? _ref1.toString() : void 0) || '';
    if (!this.number) {
      this.invisible = true;
    }
    this.numberFormatted = ((_ref2 = data.numberFormatted) != null ? _ref2.toString() : void 0) || this.number;
    this.numberHtml = escapeHtml(this.numberFormatted);
    this.name = ((_ref3 = data.name) != null ? _ref3.toString() : void 0) || '';
    this.nameLower = this.name.toLowerCase();
    this.letter = ((_ref4 = this.name[0]) != null ? _ref4.toUpperCase() : void 0) || ((_ref5 = this.number) != null ? _ref5[0].toString().toLowerCase() : void 0);
    this.nameHtml = data.name && data.name.toString() !== this.number ? escapeHtml(data.name) : this.numberHtml;
    ns = this.nameHtml.split(/\s+/);
    if (ns.length > 1) {
      this.nameHtml = '<b>' + ns[0] + '</b> ' + ns.splice(1);
    }
    lastHtml = this.elNumberHtml;
    this.elNumberHtml = this.numberHtml !== this.nameHtml ? this.numberHtml : '';
    if (this.elNumberHtml !== lastHtml && (this.el != null)) {
      this.el.find('.o_number').text(this.elNumberHtml);
    }
    if ((_ref6 = this.el) != null) {
      _ref6.find('.b_contact_title b').text(this.nameHtml);
    }
    this.avatarLink32x32 = data.avatarLink32x32 || this.defaultAvatar32 || '';
    this.defaultAvatarCss = this.avatarLink32x32 ? '' : 'm_default';
    this.departmentId = (data != null ? (_ref7 = data.numberObj) != null ? _ref7.departmentid : void 0 : void 0) && (data != null ? data.numberObj.departmentid : void 0) !== '00000000-0000-0000-0000-000000000000' ? data != null ? data.numberObj.departmentid : void 0 : this.withoutDepName;
    this.department = this.departmentId === 'www_without' ? this.langs.panel.withoutDepartment : data != null ? (_ref8 = data.numberObj) != null ? _ref8.department : void 0 : void 0;
    if (((_ref9 = data.numberObj) != null ? _ref9.state : void 0) != null) {
      this.setState(data.numberObj.state);
    } else if (data.state != null) {
      this.setState(data.state);
    } else {
      this.setState(1);
    }
    return this.loadActions();
  };

  CUser.prototype.regexps = {
    name: /\{\{name\}\}/,
    number: /\{\{number\}\}/,
    avatarLink32x32: /\{\{avatarLink32x32\}\}/,
    css: /\{\{css\}\}/,
    letter: /\{\{letter\}\}/
  };

  CUser.prototype.setState = function(state) {
    var _this = this;

    state = parseInt(state);
    if (state === this.state) {
      return;
    }
    this.state = state;
    this.setStateCss();
    if (this.buttonEls.length) {
      this.loadActions();
      return setTimeout(function() {
        return _this.loadActions();
      }, 100);
    }
  };

  CUser.prototype.setStateCss = function() {
    if (this.els.length) {
      if (this.state === 0) {
        return this.els.removeClass('m_busy').addClass('m_offline');
      } else if (this.state === 5) {
        return this.els.removeClass('m_offline').addClass('m_busy');
      } else {
        return this.els.removeClass('m_offline').removeClass('m_busy');
      }
    }
  };

  CUser.prototype.getInfo = function() {
    return '"' + this.number + '" ' + this.state + ' ' + this.name;
  };

  CUser.prototype.isFiltered = function(filter, showOffline) {
    if ((!filter || typeof filter !== 'string') && (showOffline || (!showOffline && this.state !== 0))) {
      return true;
    }
    if ((showOffline || (!showOffline && this.state !== 0)) && ((this.number && this.number.indexOf(filter) !== -1) || (' ' + this.name).toLowerCase().indexOf(filter) !== -1)) {
      return true;
    }
    return false;
  };

  CUser.prototype.showLetter = function(show) {
    var _ref;

    return (_ref = this.el) != null ? _ref.find('.b_capital_letter span').text(show ? this.letter : '') : void 0;
  };

  CUser.prototype.getEl = function(createIndependent) {
    var $el, str;

    if (!this.el || createIndependent) {
      str = this.template.replace(this.regexps.name, this.nameHtml).replace(this.regexps.number, this.numberHtml !== this.nameHtml ? this.numberHtml : '').replace(this.regexps.avatarLink32x32, this.avatarLink32x32).replace(this.regexps.css, this.defaultAvatarCss);
      $el = $(str);
      $el.data('user', this);
      this.initButtonEl($el.find('.oktell_button_action'));
      this.els = this.els.add($el);
      this.setStateCss();
      if (!this.el) {
        this.el = $el;
      }
    }
    $el = $el || this.el;
    return $el;
  };

  CUser.prototype.initButtonEl = function($el) {
    var _this = this;

    this.buttonEls = this.buttonEls.add($el);
    $el.data('user', this);
    $el.children(':first').bind('click', function() {
      return _this.doAction(_this.buttonLastAction);
    });
    if (this.buttonLastAction) {
      return $el.addClass(this.firstLiCssPrefix + this.buttonLastAction.toLowerCase());
    }
  };

  CUser.prototype.getButtonEl = function() {
    var $el;

    $el = $(this.buttonTemplate);
    this.initButtonEl($el);
    return $el;
  };

  CUser.prototype.isHovered = function(isHovered) {
    if (this.hasHover === isHovered) {
      return;
    }
    this.hasHover = isHovered;
    if (this.hasHover) {
      return this.loadActions();
    }
  };

  CUser.prototype.loadOktellActions = function() {
    var actions;

    actions = this.oktell.getPhoneActions(this.id || this.number);
    return actions;
  };

  CUser.prototype.loadActions = function() {
    var action, actions;

    actions = this.loadOktellActions();
    action = (actions != null ? actions[0] : void 0) || '';
    if (this.buttonLastAction === action) {
      return actions;
    }
    if (this.buttonLastAction) {
      this.buttonEls.removeClass(this.firstLiCssPrefix + this.buttonLastAction.toLowerCase());
    }
    if (action) {
      this.buttonLastAction = action;
      this.buttonEls.addClass(this.firstLiCssPrefix + this.buttonLastAction.toLowerCase());
    } else {
      this.buttonLastAction = '';
    }
    return actions;
  };

  CUser.prototype.doAction = function(action) {
    var target;

    if (!action) {
      return;
    }
    target = this.number;
    if (typeof this.beforeAction === "function") {
      this.beforeAction(action);
    }
    switch (action) {
      case 'call':
        return this.oktell.call(target);
      case 'conference':
        return this.oktell.conference(target);
      case 'intercom':
        return this.oktell.intercom(target);
      case 'transfer':
        return this.oktell.transfer(target);
      case 'toggle':
        return this.oktell.toggle();
      case 'ghostListen':
        return this.oktell.ghostListen(target);
      case 'ghostHelp':
        return this.oktell.ghostHelp(target);
      case 'ghostConference':
        return this.oktell.ghostConference(target);
      case 'endCall':
        return this.oktell.endCall(target);
    }
  };

  CUser.prototype.doLastFirstAction = function() {
    if (this.buttonLastAction) {
      this.doAction(this.buttonLastAction);
      return true;
    } else {
      return false;
    }
  };

  CUser.prototype.letterVisibility = function(show) {
    if (this.el && this.el.length) {
      if (show) {
        return this.el.find('.b_capital_letter span').text(this.letter);
      } else {
        return this.el.find('.b_capital_letter span').text('');
      }
    }
  };

  return CUser;

})();
