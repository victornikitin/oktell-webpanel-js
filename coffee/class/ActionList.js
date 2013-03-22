// Generated by CoffeeScript 1.6.2
var ActionList;

ActionList = (function() {
  function ActionList(oktell, $menu) {
    var timeout_id,
      _this = this;

    this.allItems = {
      call: {
        icon: '/img/icons/action/call.png',
        iconWhite: '/img/icons/action/white/call.png',
        text: 'Позвонить'
      },
      conference: {
        icon: '/img/icons/action/confinvite.png',
        iconWhite: '/img/icons/action/white/confinvite.png',
        text: 'Конференция'
      },
      transfer: {
        icon: '/img/icons/action/transfer.png',
        text: 'Перевести'
      },
      toggle: {
        icon: '/img/icons/action/toggle.png',
        text: 'Переключиться'
      },
      intercom: {
        icon: '/img/icons/action/intercom.png',
        text: 'Интерком'
      },
      endCall: {
        icon: '/img/icons/action/endcall.png',
        iconWhite: '/img/icons/action/white/endcall.png',
        text: 'Завершить'
      },
      ghostListen: {
        icon: '/img/icons/action/ghost_monitor.png',
        text: 'Прослушка'
      },
      ghostHelp: {
        icon: '/img/icons/action/ghost_help.png',
        text: 'Помощь'
      }
    };
    this.allItems = {
      call: {
        icon: '/img/icons/action/call.png',
        iconWhite: '/img/icons/action/white/call.png',
        text: this.langs.call
      },
      conference: {
        icon: '/img/icons/action/confinvite.png',
        iconWhite: '/img/icons/action/white/confinvite.png',
        text: this.langs.conference
      },
      transfer: {
        icon: '/img/icons/action/transfer.png',
        text: this.langs.transfer
      },
      toggle: {
        icon: '/img/icons/action/toggle.png',
        text: this.langs.toggle
      },
      intercom: {
        icon: '/img/icons/action/intercom.png',
        text: this.langs.intercom
      },
      endCall: {
        icon: '/img/icons/action/endcall.png',
        iconWhite: '/img/icons/action/white/endcall.png',
        text: this.langs.endCall
      },
      ghostListen: {
        icon: '/img/icons/action/ghost_monitor.png',
        text: this.langs.ghostListen
      },
      ghostHelp: {
        icon: '/img/icons/action/ghost_help.png',
        text: this.langs.ghostHelp
      }
    };
    _.each(this.allItems, function(v, k) {
      v.id = k;
      v.firstClass = ko.observable(false);
      v.lastClass = ko.observable(false);
      return v.css = ko.computed(function() {
        var css;

        css = 'i_' + k;
        if (v.firstClass()) {
          css += ' g_first';
        }
        if (v.lastClass()) {
          css += ' g_last';
        }
        return css;
      });
    });
    this.actions = ko.observableArray([]);
    this.target = ko.observable();
    this.panelNumber = ko.observable('');
    this.menu = $menu;
    timeout_id = '';
    this.menu.hover(function() {
      return clearTimeout(timeout_id);
    }, function() {
      return timeout_id = setTimeout(function() {
        var x;

        x = 1;
        return _this.menu.fadeOut(150);
      }, 500);
    });
    this.showActions = function(actions, number, ul) {
      _this.actions(actions || []);
      _this.target(number || '');
      return _this.showList(ul);
    };
    this.doActionByClick = function(item) {
      return _this.doAction(item);
    };
    this.doAction = function(item, target) {
      var action;

      action = item.id || item;
      target = target || _this.target();
      if (!action || !target) {
        return;
      }
      switch (action) {
        case 'call':
          return oktell.call(target);
        case 'conference':
          return oktell.conference(target);
        case 'intercom':
          return oktell.intercom(target);
        case 'transfer':
          return oktell.transfer(target);
        case 'toggle':
          return oktell.toggle();
        case 'ghostListen':
          return oktell.ghostListen(target);
        case 'ghostHelp':
          return oktell.ghostHelp(target);
        case 'ghostConference':
          return oktell.ghostConference(target);
        case 'endCall':
          return oktell.endCall(target);
      }
    };
    this.showList = function(ul) {
      var width_menu;

      width_menu = _this.menu.width();
      _this.menu.css({
        'top': ul.offset().top,
        'left': ul.offset().left - width_menu + ul.width(),
        'visibility': 'visible'
      });
      return _this.menu.fadeIn(100);
    };
    this.getItems = function(actions) {
      var items;

      if (actions == null) {
        actions = [];
      }
      items = [];
      _.each(actions, function(a) {
        var i;

        i = _this.allItems[a];
        if (i) {
          if (items.length === 0) {
            i.firstClass(true);
          }
          i.lastClass(false);
          return items.push(i);
        }
      });
      if (items.length > 1) {
        _.last(items).lastClass(true);
      }
      return items;
    };
    this.panelItems = ko.computed(function() {
      var actions, number;

      number = _this.panelNumber();
      if (!number || !oktell.getMyInfo().oktellBuild) {
        return [];
      }
      actions = oktell.getPhoneActions(number);
      return _this.getItems(actions);
    });
    this.items = ko.computed(function() {
      var acts;

      acts = _this.actions() || [];
      return _this.getItems(acts);
    });
    this.panelItemsCount = ko.computed(function() {
      return _this.panelItems().length;
    });
    oktell.on('oktellConnected', function() {
      _this.panelNumber.notifySubscribers();
      return oktell.on('stateChange', function() {
        return _this.panelNumber.notifySubscribers();
      });
    });
    this.doPanelAction = function(item) {
      return _this.doAction(item.id, _this.panelNumber());
    };
    this.afterClear = function() {};
    return;
  }

  return ActionList;

})();
