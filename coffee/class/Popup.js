var Popup;

Popup = (function() {
  Popup.prototype.logGroup = 'Popup';

  function Popup(popupEl, oktell, ringtone) {
    var abonentsSet, hidePopupAndResetAbonents;
    this.el = popupEl;
    this.ringtone = ringtone;
    this.absContainer = this.el.find('.b_content');
    this.abonentEl = this.absContainer.find('.b_abonent').remove();
    this.answerActive = false;
    this.answerButttonEl = this.el.find('.j_answer');
    this.puckupEl = this.el.find('.j_pickup');
    this.el.find('.j_abort_action').bind('click', (function(_this) {
      return function() {
        _this.hide();
        _this.playRingtone(false);
        return oktell.endCall();
      };
    })(this));
    this.el.find('.j_answer').bind('click', (function(_this) {
      return function() {
        _this.hide();
        _this.playRingtone(false);
        return oktell.answer();
      };
    })(this));
    this.el.find('.j_close_action').bind('click', (function(_this) {
      return function() {
        return _this.hide();
      };
    })(this));
    this.el.find('i.o_close').bind('click', (function(_this) {
      return function() {
        return _this.hide();
      };
    })(this));
    abonentsSet = false;
    oktell.on('connect', (function(_this) {
      return function() {
        return _this.users = oktell.getUsers();
      };
    })(this));
    oktell.on('webrtcRingStart', (function(_this) {
      return function(name, identity) {
        var _ref;
        _this.log('webrtcRingStart, ' + identity);
        _this.playRingtone(true);
        _this.answerButtonVisible(true);
        if (!abonentsSet) {
          _this.setAbonents([
            {
              name: name,
              phone: ((_ref = identity.match(/<sip:([\s\S]+?)@/)) != null ? _ref[1] : void 0) || ''
            }
          ]);
        }
        return _this.show();
      };
    })(this));
    oktell.on('ringStart backRingStart', (function(_this) {
      return function(abonents) {
        _this.log('ringStart', abonents);
        _this.setAbonents(abonents);
        setTimeout(function() {
          var _ref, _ref1;
          if ((abonents != null ? (_ref = abonents[0]) != null ? _ref.phone : void 0 : void 0) && ((_ref1 = oktell.getPhoneActions(abonents[0].phone)) != null ? typeof _ref1.indexOf === "function" ? _ref1.indexOf('answer') : void 0 : void 0) !== -1) {
            return _this.answerButtonVisible(true);
          }
        }, 10);
        abonentsSet = true;
        return _this.show();
      };
    })(this));
    hidePopupAndResetAbonents = (function(_this) {
      return function() {
        _this.playRingtone(false);
        _this.hide();
        abonentsSet = false;
        return _this.setAbonents([]);
      };
    })(this);
    oktell.on('ringStop', hidePopupAndResetAbonents);
    oktell.on("stateChange", (function(_this) {
      return function(newState, oldState) {
        if (newState === "call" && oldState === "backring") {
          return hidePopupAndResetAbonents();
        }
      };
    })(this));
    this.answerButtonVisible(false);
  }

  Popup.prototype.playRingtone = function(play) {
    var e;
    try {
      if (this.ringtone) {
        if (play) {
          this.ringtone.currentTime = 0;
          return this.ringtone.play();
        } else {
          return this.ringtone.pause();
        }
      }
    } catch (_error) {
      e = _error;
      return this.log("playRingtone " + play + " throw error", e);
    }
  };

  Popup.prototype.show = function(abonents) {
    this.log('Popup show! ', abonents);
    return this.el.fadeIn(200);
  };

  Popup.prototype.hide = function() {
    this.playRingtone(false);
    return this.el.fadeOut(200);
  };

  Popup.prototype.setAbonents = function(abonents) {
    this.absContainer.empty();
    return $.each(abonents, (function(_this) {
      return function(i, abonent) {
        var el, foundInUsers, name, phone, phoneFormatted, u, user, _ref, _ref1, _ref2;
        if (!abonent) {
          _this.log('setAbonent: bad abonent');
          return;
        }
        phoneFormatted = (_ref = abonent.phoneFormatted) != null ? typeof _ref.toString === "function" ? _ref.toString() : void 0 : void 0;
        phone = (_ref1 = abonent.phone) != null ? typeof _ref1.toString === "function" ? _ref1.toString() : void 0 : void 0;
        name = (_ref2 = abonent.name) != null ? typeof _ref2.toString === "function" ? _ref2.toString() : void 0 : void 0;
        if (name === phone) {
          foundInUsers = false;
          for (u in _this.users) {
            user = _this.users[u];
            if (user.number === phone) {
              name = user.name;
              foundInUsers = true;
              break;
            }
          }
          _this.log("Found " + phone + " in users = " + foundInUsers);
          if (!foundInUsers) {
            name = phoneFormatted || phone;
            phone = '';
          }
        } else {
          name = abonent.name.toString();
        }
        el = _this.abonentEl.clone();
        el.find('span:first').text(name);
        el.find('span:last').text(phone);
        return _this.absContainer.append(el);
      };
    })(this));
  };

  Popup.prototype.answerButtonVisible = function(val) {
    if (val) {
      this.answerActive = true;
      this.answerButttonEl.show();
      this.puckupEl.hide();
    } else {
      this.answerActive = false;
      this.answerButttonEl.hide();
      this.puckupEl.show();
    }
    return this.answerActive;
  };

  Popup.prototype.setCallbacks = function(onAnswer, onTerminate) {
    this.onAnswer = onAnswer;
    return this.onTerminate = onTerminate;
  };

  return Popup;

})();