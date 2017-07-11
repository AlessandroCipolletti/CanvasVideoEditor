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

    Main.loadTemplate("header", {
      name: app.NAME
    }, Param.container, function (templateDom) {

      templateDom.addEventListener(Param.eventStart, Utils.preventDefault);
      templateDom.addEventListener(Param.eventMove, Utils.preventDefault);
      // Main.addRotationHandler(_onRotate);

    });

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
