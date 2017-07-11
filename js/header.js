/*
  Documentations:

*/
(function (app) {
  "use strict";
  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var Messages = {};

  var _config = {

  };

  var _container = {};

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _container = Utils.createDom("habillage-header__container");
    var logo = document.createElement("div");
    logo.classList.add("habillage-header__logo");
    _container.appendChild(logo);
    _container.addEventListener(Param.eventStart, Utils.preventDefault);
    _container.addEventListener(Param.eventMove, Utils.preventDefault);
    Param.container.appendChild(_container);
    // Main.addRotationHandler(_onRotate);

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Messages = app.Messages;
    _config = Utils.setConfig(params, _config);
    _initDom();
    Param.headerSize = 50.5 * Param.pixelRatio;

  }

  app.module("Header", {
    init
  });

})(APP);
