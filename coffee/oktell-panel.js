// Generated by CoffeeScript 1.6.2
(function($) {
  var actionButtonHtml, actionListEl, actionListHtml, addActionButtonToEl, afterOktellConnect, defaultOptions, getOptions, initActionButtons, initButtonOnElement, initPanel, langs, list, loadTemplate, oktell, oktellConnected, options, panelEl, panelHtml, panelWasInitialized, templates, userTemplateHtml;

  if (!$) {
    throw new Error('Error init oktell panel, jQuery ( $ ) is not defined');
  }
  templates = {};
  loadTemplate = function(path) {
    var html;

    if (templates[path] != null) {
      return templates[path];
    }
    html = '';
    $.ajax({
      url: path,
      async: false,
      success: function(data) {
        return html = data;
      }
    });
    return html;
  };
  actionButtonHtml = loadTemplate('/templates/actionButton.html');
  defaultOptions = {
    position: 'right',
    dynamic: true,
    animateTimout: 200,
    oktell: window.oktell,
    buttonCss: 'oktellActionButton',
    debug: false
  };
  langs = {
    panel: {
      inTalk: 'В разговоре',
      onHold: 'На удержании',
      queue: 'Очередь ожидания',
      inputPlaceholder: 'введите имя или номер'
    },
    actions: {
      call: 'Позвонить',
      conference: 'Конференция',
      transfer: 'Перевести',
      toggle: 'Переключиться',
      intercom: 'Интерком',
      endCall: 'Завершить',
      ghostListen: 'Прослушка',
      ghostHelp: 'Помощь'
    }
  };
  options = null;
  actionListEl = null;
  oktell = null;
  oktellConnected = false;
  afterOktellConnect = null;
  list = null;
  getOptions = function() {
    return options || defaultOptions;
  };
  actionListHtml = loadTemplate('/templates/actionList.html');
  List.prototype.langs = langs.actions;
  List.prototype.jScroll = jScroll;
  userTemplateHtml = loadTemplate('/templates/user.html');
  CUser.prototype.template = userTemplateHtml.replace('<!--button-->', actionButtonHtml);
  CUser.prototype.buttonTemplate = actionButtonHtml;
  panelHtml = loadTemplate('/templates/panel.html');
  panelHtml = panelHtml.replace('{{inTalk}}', langs.panel.inTalk).replace('{{onHold}}', langs.panel.onHold).replace('{{queue}}', langs.panel.queue).replace('{{inputPlaceholder}}', langs.panel.inputPlaceholder);
  panelEl = $(panelHtml);
  panelWasInitialized = false;
  initPanel = function(opts) {
    var $user, $userActionButton, animOptHide, animOptShow, closeClass, critWidth, cssPos, element, elementWidth, hidePanel, killPanelHideTimer, mouseOnPanel, newCssPos, oldBinding, openClass, panelBookmarkEl, panelHideTimer, panelPos, panelStatus, walkAway, xPos, xStartPos;

    panelWasInitialized = true;
    options = $.extend(defaultOptions, opts || {});
    $user = $(userTemplateHtml);
    $userActionButton = $(actionButtonHtml);
    oldBinding = $userActionButton.attr('data-bind');
    $userActionButton.attr('data-bind', oldBinding + ', visible: $data.actionBarIsVisible');
    $user.find('td.b_contact_title').append($userActionButton);
    actionListEl = $(actionListHtml);
    $('body').append(actionListEl);
    oktell = getOptions().oktell;
    panelPos = getOptions().position;
    animOptShow = {};
    animOptShow[panelPos] = '0px';
    animOptHide = {};
    animOptHide[panelPos] = '-281px';
    $("body").append(panelEl);
    list = new List(oktell, panelEl, actionListEl, afterOktellConnect, getOptions().debug);
    if (getOptions().debug) {
      window.wList = list;
    }
    if (panelPos === "right") {
      panelEl.addClass("right");
    } else if (panelPos === "left") {
      panelEl.addClass("left");
    }
    if (getOptions().dynamic) {
      panelEl.addClass("dynamic");
    }
    panelBookmarkEl = panelEl.find('.i_panel_bookmark');
    mouseOnPanel = false;
    panelHideTimer = false;
    panelStatus = 'closed';
    killPanelHideTimer = function() {
      clearTimeout(panelHideTimer);
      return panelHideTimer = false;
    };
    panelEl.on("mouseenter", function() {
      mouseOnPanel = true;
      killPanelHideTimer();
      if (parseInt(panelEl.css(panelPos)) < 0 && (panelStatus === 'closed' || panelStatus === 'closing')) {
        panelStatus = 'opening';
        panelBookmarkEl.stop(true, true);
        panelBookmarkEl.animate({
          left: '0px'
        }, 50, 'swing');
        panelEl.stop(true, true);
        panelEl.animate(animOptShow, 100, "swing", function() {
          panelEl.addClass("g_hover");
          return panelStatus = 'open';
        });
      }
      return true;
    });
    hidePanel = function() {
      if (panelEl.hasClass("g_hover")) {
        panelStatus = 'closing';
        panelEl.stop(true, true);
        panelEl.animate(animOptHide, 300, "swing", function() {
          panelEl.css({
            panelPos: 0
          });
          panelEl.removeClass("g_hover");
          return panelStatus = 'closed';
        });
        return setTimeout(function() {
          return panelBookmarkEl.animate({
            left: '-40px'
          }, 50, 'swing');
        }, 150);
      }
    };
    panelEl.on("mouseleave", function() {
      mouseOnPanel = false;
      return true;
    });
    $('html').bind('mouseleave', function(e) {
      killPanelHideTimer();
      return true;
    });
    $('html').bind('mousemove', function(e) {
      if (!mouseOnPanel && panelHideTimer === false && !list.dropdownOpenedOnPanel) {
        panelHideTimer = setTimeout(function() {
          return hidePanel();
        }, 100);
      }
      return true;
    });
    if (window.navigator.userAgent.indexOf('iPad') !== -1) {
      xStartPos = 0;
      xPos = 0;
      element = panelEl;
      elementWidth = 0;
      critWidth = 0;
      cssPos = -281;
      walkAway = 0;
      newCssPos = 0;
      openClass = "j_open";
      closeClass = "j_close";
      if (parseInt(element[0].style.right) < 0) {
        element.addClass(closeClass);
      }
      element.live("click", function() {
        if (element.hasClass(closeClass)) {
          return element.animate(animOptShow, 200, "swing", function() {
            element.removeClass(closeClass).addClass(openClass);
            return walkAway = 0;
          });
        }
      });
      element.live("touchstart", function(e) {
        xStartPos = e.originalEvent.touches[0].pageX;
        elementWidth = element.width();
        critWidth = (elementWidth / 100) * 13;
        return cssPos = parseInt(element.css(panelPos));
      });
      element.bind("touchmove", function(e) {
        e.preventDefault();
        xPos = e.originalEvent.touches[0].pageX;
        walkAway = xPos - xStartPos;
        newCssPos = cssPos - walkAway;
        if (newCssPos < -281) {
          newCssPos = -281;
        } else if (newCssPos > 0) {
          newCssPos = 0;
        }
        return element[0].style.right = newCssPos + 'px';
      });
      element.bind("touchend", function(e) {
        if (walkAway >= critWidth && walkAway < 0) {
          return element.animate(animOptHide, 200, "swing");
        }
      });
      if (walkAway * -1 >= critWidth && walkAway > 0) {
        element.animate(animOptShow, 200, "swing");
      }
      if (walkAway < critWidth && walkAway < 0) {
        element.animate(animOptShow, 100, "swing", function() {
          return element.removeClass(closeClass).addClass(openClass);
        });
      }
      if (walkAway * -1 < critWidth && walkAway > 0) {
        return element.animate(animOptHide, 100, "swing", function() {
          return element.removeClass(openClass).addClass(closeClass);
        });
      }
    }
  };
  afterOktellConnect = function() {
    return oktellConnected = true;
  };
  initButtonOnElement = function(el) {
    var button, phone;

    el.addClass(getOptions().buttonCss);
    phone = el.attr('data-phone');
    if (phone) {
      button = list.getUserButtonForPlugin(phone);
      log('generated button for ' + phone, button);
      return el.html(button);
    }
  };
  addActionButtonToEl = function(el) {
    return initButtonOnElement(el);
  };
  initActionButtons = function(selector) {
    return $(selector + ":not(." + actionButtonContainerClass + ")").each(function() {
      return addActionButtonToEl($(this));
    });
  };
  $.oktellPanel = function(arg) {
    if (typeof arg === 'string') {
      if (panelWasInitialized) {
        return initActionButtons(arg);
      }
    } else if (!panelWasInitialized) {
      return initPanel(arg);
    }
  };
  return $.fn.oktellButton = function() {
    return $(this).each(function() {
      return addActionButtonToEl($(this));
    });
  };
})($);
