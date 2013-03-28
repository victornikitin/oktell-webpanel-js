// Generated by CoffeeScript 1.6.2
var jScroll,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

jScroll = function($el) {
  var END_EVENT, MOVE_EVENT, START_EVENT, WHEEL_EV, get_koef, get_pageY, get_position, init, isTouch, jscroll_timer, move_by_bar, pageY_end, pageY_start, params, pos, pos_start, scrollClick, scrollTo, scrollWheelPos, scroll_hide, scroll_show, scrollbar_cont, scrollbar_inner, scroller, scroller_left_while_scrolling, scrolling, set_bar_bounds, set_position, vendor, wrapper,
    _this = this;

  wrapper = '';
  scroller = '';
  scrollbar_cont = '';
  scrollbar_inner = '';
  scroller_left_while_scrolling = '';
  move_by_bar = '';
  pageY_end = '';
  pageY_start = '';
  pos = '';
  pos_start = '';
  scrolling = '';
  params = {};
  scrollWheelPos = function(e, wrapper, scroller, scrollbar_cont, scrollbar_inner) {
    var wheelDeltaY;

    e = e.originalEvent;
    wheelDeltaY = e.detail ? e.detail * (-14) : e.wheelDelta / 3;
    pos_start = get_position(scroller);
    pageY_end = get_pageY(e);
    if (pos_start >= 0 && wheelDeltaY > 0 || (pos_start + wheelDeltaY) > 0) {
      wheelDeltaY = 0;
      pos_start = 0;
    }
    if ((pos_start <= (wrapper.height() - scroller.height())) && wheelDeltaY < 0 || (pos_start + wheelDeltaY) < wrapper.height() - scroller.height()) {
      pos_start = wrapper.height() - scroller.height();
      wheelDeltaY = 0;
    }
    pos = pos_start + wheelDeltaY;
    return pos;
  };
  scrollClick = function(e, wrapper, scroller, scrollbar_cont, scrollbar_inner) {
    var koef_bar, max_pos;

    if (e.type === START_EVENT) {
      if (params.noMoveMouse) {
        return;
      }
      pageY_start = get_pageY(e);
      pos_start = get_position(scroller);
      scrolling = true;
      return $('body').css({
        '-moz-user-select': 'none',
        '-ms-user-select': 'none',
        '-khtml-user-select': 'none',
        '-webkit-user-select': 'none',
        '-webkit-touch-callout': 'none',
        'user-select': 'none'
      });
    } else if (e.type === MOVE_EVENT) {
      if (!scrolling) {
        return;
      }
      if (isTouch) {
        scroll_show(scrollbar_inner);
      }
      koef_bar = get_koef(wrapper, scroller);
      pageY_end = get_pageY(e);
      if (move_by_bar) {
        pos = pos_start * koef_bar - (pageY_end - pageY_start);
        pos = pos / koef_bar;
      } else {
        pos = pos_start + (pageY_end - pageY_start);
      }
      if (pos >= 0) {
        pos_start = get_position(scroller);
        pageY_start = pageY_end;
        pos = 0;
      }
      max_pos = wrapper.height() - scroller.height();
      if (pos <= max_pos) {
        pos_start = get_position(scroller);
        pageY_start = pageY_end;
        pos = max_pos;
      }
      scrollTo(pos, wrapper, scroller, scrollbar_cont, scrollbar_inner);
      return params.noMoveMouse = true;
    } else if (e.type === END_EVENT) {
      if (!scrolling) {
        return;
      }
      scrolling = false;
      move_by_bar = false;
      if (isTouch) {
        scroll_hide(scrollbar_inner);
      }
      $('body').css({
        '-moz-user-select': '',
        '-ms-user-select': '',
        '-khtml-user-select': '',
        '-webkit-user-select': '',
        '-webkit-touch-callout': '',
        'user-select': ''
      });
      if (scroller_left_while_scrolling) {
        return scroll_hide(scrollbar_inner);
      }
    } else {

    }
  };
  scrollTo = function(posTop, wrapper, scroller, scrollbar_cont, scrollbar_inner) {
    scroll_show(scrollbar_inner);
    set_position(scroller, posTop);
    return set_bar_bounds(wrapper, scroller, scrollbar_cont, scrollbar_inner);
  };
  get_pageY = function(e) {
    if (isTouch) {
      return e.originalEvent.targetTouches[0].clientY;
    } else {
      return e.clientY;
    }
  };
  set_position = function(object, pos) {
    return object.css({
      'position': 'relative',
      'top': pos
    });
  };
  get_position = function(object) {
    var position;

    position = object.css('top');
    if (position === 'auto') {
      position = 0;
    }
    return parseInt(position);
  };
  get_koef = function(wrapper, scroller) {
    var koef, s_height, w_height;

    w_height = wrapper.height();
    s_height = scroller.height();
    koef = w_height / s_height;
    return koef;
  };
  scroll_show = function(scrollbar_inner) {
    scrollbar_inner.stop(true, true);
    return scrollbar_inner.fadeIn(100);
  };
  scroll_hide = function(scrollbar_inner) {
    scrollbar_inner.stop(true, true);
    return scrollbar_inner.fadeOut("slow");
  };
  set_bar_bounds = function(wrapper, scroller, scrollbar_cont, scrollbar_inner) {
    var c_height, inner_height, koef, pos_koef, scroller_height, scroller_position, visibility, wrapper_height;

    c_height = scrollbar_cont.height();
    koef = get_koef(wrapper, scroller);
    inner_height = c_height * koef;
    if (koef >= 1) {
      visibility = 'hidden';
    } else {
      visibility = 'visible';
    }
    scrollbar_inner.css({
      'height': inner_height,
      'visibility': visibility
    });
    scroller_position = get_position(scroller);
    wrapper_height = wrapper.height();
    scroller_height = scroller.height();
    if (scroller_position <= 0 && scroller_position <= (wrapper_height - scroller_height)) {
      pos = wrapper_height - scroller_height;
      pos = Math.min(pos, 0);
      set_position(scroller, pos);
    }
    pos_koef = scroller_position / wrapper_height;
    pos = wrapper_height * pos_koef;
    set_position(scrollbar_inner, pos * koef * -1);
    return params != null ? typeof params.onScroll === "function" ? params.onScroll({
      wrapper: wrapper,
      scroller: scroller,
      position: scroller_position,
      length: scroller_height
    }) : void 0 : void 0;
  };
  scrolling = false;
  move_by_bar = false;
  vendor = /webkit/i.test(navigator.appVersion) ? 'webkit' : /firefox/i.test(navigator.userAgent) ? 'Moz' : __indexOf.call(window, 'opera') >= 0 ? 'O' : '';
  isTouch = typeof window['ontouchstart'] !== 'undefined';
  START_EVENT = isTouch ? 'touchstart' : 'mousedown';
  MOVE_EVENT = isTouch ? 'touchmove' : 'mousemove';
  END_EVENT = isTouch ? 'touchend' : 'mouseup';
  WHEEL_EV = vendor === 'Moz' ? 'DOMMouseScroll' : 'mousewheel';
  if (!isTouch && $('.jscroll_wrapper', $el).size()) {
    return;
  }
  init = function() {
    var myScroll, scrollbar_bar, scroller_inner;

    $el.wrapInner('<div class="jscroll_wrapper" />');
    wrapper = $(".jscroll_wrapper", $el);
    wrapper.attr("id", "jscroll_id" + Math.round(Math.random() * 10000000));
    scroller = wrapper.wrapInner('<div class="jscroll_scroller" />');
    scroller = $(".jscroll_scroller", wrapper);
    scrollbar_cont = $('<div class="jscroll_scrollbar_cont"></div>').insertAfter(scroller);
    scrollbar_cont.css({
      'position': 'absolute',
      'right': '0px',
      'width': '13px',
      'top': '3px',
      'bottom': '6px'
    });
    scrollbar_inner = $('<div class="jscroll_scrollbar_inner"></div>').appendTo(scrollbar_cont);
    scrollbar_inner.css({
      'position': 'relative',
      'width': '100%',
      'display': 'none',
      'opacity': '0.4',
      'cursor': 'pointer'
    });
    scrollbar_bar = $('<div class="jscroll_scrollbar_bar"></div>').appendTo(scrollbar_inner);
    scrollbar_bar.css({
      'position': 'relative',
      'background': 'black',
      'width': '5px',
      'margin': '0 auto',
      'border-radius': '3px',
      'height': '100%',
      '-webkit-border-radius': '3px'
    });
    wrapper.css({
      "position": "relative",
      "height": "100%",
      "overflow": "hidden"
    });
    scroller.css({
      "min-height": "100%",
      "overflow": "hidden"
    });
    if (isTouch) {
      scroller.after('<div class="jscroll_scroller_inner" />');
      scroller_inner = $(".jscroll_scroller_inner", wrapper);
      scroller_inner.appendTo('<div></div>');
      myScroll = new iScroll(wrapper.attr("id"), {
        hScrollbar: false,
        scrollbarClass: 'jscroll_scroller_inner',
        checkDOMChanges: true,
        bounceLock: true,
        onScrollMove: function() {
          params.onScroll();
          return true;
        },
        onScrollEnd: function() {
          params.onScroll();
          return true;
        }
      });
      return true;
    } else {
      return set_bar_bounds(wrapper, scroller, scrollbar_cont, scrollbar_inner);
    }
  };
  init();
  if (isTouch) {
    return;
  }
  jscroll_timer = new Array;
  wrapper.bind('resize', function(e) {
    var timer_id;

    timer_id = wrapper.attr('id');
    if (typeof jscroll_timer[timer_id] !== 'undefined') {
      clearTimeout(jscroll_timer[timer_id]);
    }
    jscroll_timer[timer_id] = setTimeout(function() {
      set_bar_bounds(wrapper, scroller, scrollbar_cont, scrollbar_inner);
      return delete jscroll_timer[timer_id];
    }, 100);
  });
  if (!isTouch) {
    wrapper.hover(function() {
      scroller_left_while_scrolling = false;
      set_bar_bounds(wrapper, scroller, scrollbar_cont, scrollbar_inner);
      scroll_show(scrollbar_inner);
    }, function() {
      scroller_left_while_scrolling = true;
      if (scrolling) {
        return;
      }
      scroll_hide(scrollbar_inner);
    });
  }
  scrollbar_inner.bind(START_EVENT, function(e) {
    move_by_bar = true;
    params.noMoveMouse = false;
    return true;
  });
  wrapper.bind(START_EVENT, function(e) {
    scrollClick(e, wrapper, scroller, scrollbar_cont, scrollbar_inner);
    return true;
  });
  $(document).bind(MOVE_EVENT, function(e) {
    scrollClick(e, wrapper, scroller, scrollbar_cont, scrollbar_inner);
    return true;
  });
  $(document).bind(END_EVENT, function(e) {
    scrollClick(e, wrapper, scroller, scrollbar_cont, scrollbar_inner);
    return true;
  });
  return wrapper.on(WHEEL_EV, function(e) {
    var wheelPos;

    wheelPos = scrollWheelPos(e, wrapper, scroller, scrollbar_cont, scrollbar_inner);
    scrollTo(wheelPos, wrapper, scroller, scrollbar_cont, scrollbar_inner);
    return false;
  });
};
