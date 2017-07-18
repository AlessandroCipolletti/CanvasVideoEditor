/*
  Documentations:

*/
(function (app) {
  "use strict";
  var _config = {
    testDebug: true
  };

  var param = {};

  function _setConfig(params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  param.init = function (params) {

    _setConfig(params);
    param.appName = app.NAME;
    param.appVersion = app.VERSION;
    param.templatePath = "tpl/";
    param.cssPath = "css/";

    param.isDebug = _config.testDebug;

    // TODO .android, .isPhone, .isTablet
    // alert(navigator.userAgent)
    param.android = false;
    param.ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    param.iosVersion = parseFloat(('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1]).replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false;
    param.isTablet = param.ipad;
    param.isPhone = param.iphone;
    param.isMobile = (navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)) instanceof Array;
    param.isDesktop = !param.isMobile;
    param.isAppOnline = (document.location.host.toLowerCase() === param.appName);
    param.eventResize = "onorientationchange" in window ? "orientationchange" : "resize";
    // TODO pixelRatio iphone plus
    param.pixelRatio = (param.isMobile ? (param.ios ? 2 : window.devicePixelRatio) : 1);
    param.scale = 1 / param.pixelRatio;
    param.supportTouch = ("ontouchstart" in window);
    param.supportGesture = ("ongesturechange" in window);
    param.supportOrientation = ("orientation" in window);
    // CSS params
    param.fadeTransition = 250;
    
    if (param.supportTouch) {

      param.eventStart = "touchstart";
      param.eventMove = "touchmove";
      param.eventEnd = "touchend";
      param.eventOut = "";

    } else {

      param.eventStart = "mousedown";
      param.eventMove = "mousemove";
      param.eventEnd = "mouseup";
      param.eventOut = "mouseout";

    }

  };

  app.module("Param", param);

})(APP);
