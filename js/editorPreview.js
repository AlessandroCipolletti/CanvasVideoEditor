/*
  Documentations:

*/
(function (app) {
  "use strict";
  // Dependencies
  var MATH = Math;
  var Param = {};
  var Utils = {};
  var Main = {};
  var Editor = {};
  var Controls = {};
  var Thumbnails = {};

  var _config = {
    resolution: {
      w: 0,
      h: 0
    }
  };

  var _canvas = {}, _context = {};
  var _currentFrameIndex = -1, _offsetLeft = 0, _offsetTop = 0, _offsetWidth = 0, _offsetHeight = 0;

  function setFrame (frame, force) {

    if (force || _currentFrameIndex !== frame.index) {
      _currentFrameIndex = frame.index;
      _context.clearRect(0, 0, _canvas.width, _canvas.height);
      _context.drawImage(frame.canvas, 0, 0, _canvas.width, _canvas.height);
    }

  }

  function _onCanvasClick (e) {

    var touches = Utils.filterTouchesByTarget(e, [_canvas]);
    var cursorX = Utils.getEventCoordX(touches, _offsetLeft, true);
    var cursorY = Utils.getEventCoordY(touches, _offsetTop, true);
    Editor.previewClick(
      MATH.round(cursorX / _offsetWidth * _config.resolution.w),
      MATH.round(cursorY / _offsetHeight * _config.resolution.h)
    );

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom (moduleContainer) {

    Main.loadTemplate("editorPreview", {
      param: ""
    }, moduleContainer, function (templateDom) {

      _canvas = templateDom;
      _context = _canvas.getContext("2d");
      _canvas.width = _config.resolution.w;
      _canvas.height = _config.resolution.h;
      _canvas.addEventListener(Param.eventStart, _onCanvasClick);
      var canvasRect = _canvas.getBoundingClientRect();
      _offsetLeft = MATH.round(canvasRect.left);
      _offsetTop = MATH.round(canvasRect.top);
      _offsetWidth = MATH.round(canvasRect.width);
      _offsetHeight = MATH.round(canvasRect.height);
      // Main.addRotationHandler(_onRotate);

    });

  }

  function setConfig (params) {

    _config = Utils.setConfig(params, _config);
    // TODO gerer autres formats que 16/9
    _canvas.width = _config.resolution.w;
    _canvas.height = _config.resolution.h;

  }

  function init (params, moduleContainer) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Editor = app.Editor;
    Controls = app.Editor.Controls;
    Thumbnails = app.Editor.Thumbnails;
    _config = Utils.setConfig(params, _config);
    _initDom(moduleContainer);

  }

  app.module("Editor.Preview", {
    init,
    setConfig,
    setFrame
  });

})(APP);
