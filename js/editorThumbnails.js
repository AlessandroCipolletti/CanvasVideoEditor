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
  var Preview = {};
  var Controls = {};

  var _config = {
    resolution: {
      w: 0,
      h: 0
    }
  };

  var _frames = [], _maxIndex = 0;
  var _canvas = {}, _frameWidth = 0;
  var _currentIndex = -1;

  function loadFrames (frames) {

    _frames = frames;
    _maxIndex = frames.length - 1;
    frames = undefined;

  }

  function previus () {
    if (_currentIndex > 0) {
      _setIndex(_currentIndex - 1);
      Editor.setByFrame(_currentIndex);
    }
  }

  function next () {
    if (_currentIndex < _maxIndex) {
      _setIndex(_currentIndex + 1);
      Editor.setByFrame(_currentIndex);
    }
  }

  function _setIndex (index) {

    _currentIndex = index;
    _clearCanvas(true);
    _drawCanvas(2, index);
    index > 0 && _drawCanvas(1, index - 1);
    index > 1 && _drawCanvas(0, index - 2);
    index < _maxIndex && _drawCanvas(3, index + 1);
    index + 1 < _maxIndex && _drawCanvas(4, index + 2);

  }

  function setIndex (index, force) {
    if (force || index !== _currentIndex) {
      _setIndex(index);
    }
  }

  function _clearCanvas (index) {
    if (index === true) {
      _canvas.ctx.clearRect(0, 0, _canvas.width, _canvas.height);
    } else {
      _canvas.ctx.clearRect(index * _frameWidth, 0, _frameWidth, _canvas.height);
    }
  }

  function _drawCanvas (indexCanvas, indexFrame) {
    _canvas.ctx.drawImage(_frames[indexFrame].canvas, indexCanvas * _frameWidth, 0, _frameWidth, _canvas.height);
  }

  function _onCanvasClick (e) {

    var touches = Utils.filterTouchesByTarget(e);
    var index = _currentIndex + MATH.trunc(touches[0].clientX / _frameWidth) - 2;
    if (index !== _currentIndex && index >= 0 && index <= _maxIndex) {
      _setIndex(index);
      Editor.setByFrame(_currentIndex);
    }

  }

  function _onKeyDown (e) {

  }

  function _onRotate (e) {

    var height = MATH.round(app.WIDTH / 5 * _config.resolution.h / _config.resolution.w);
    _canvas.style.height = height + "px";
    _canvas.width = app.WIDTH * Param.pixelRatio; // da verificare su mobile dove c'è viewportScale
    _frameWidth = _canvas.width / 5;
    _canvas.height = height * Param.pixelRatio;
    if (_currentIndex >= 0) {
      setIndex(_currentIndex, true);
    }

  }

  function setConfig (params) {
    _config = Utils.setConfig(params, _config);
    _onRotate();
  }

  function _initDom (moduleContainer) {

    Main.loadTemplate("editorThumbnails", {}, moduleContainer, function (templateDom) {

      _canvas = templateDom;
      _canvas.ctx = _canvas.getContext("2d");
      _canvas.addEventListener(Param.eventStart, _onCanvasClick, true);
      document.addEventListener("keydown", _onKeyDown);
      Main.addRotationHandler(_onRotate);
      _onRotate();

    });

  }

  function init (params, moduleContainer) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Editor = app.Editor;
    Preview = app.Editor.Preview;
    Controls = app.Editor.Controls;
    _config = Utils.setConfig(params, _config);
    _initDom(moduleContainer);

  }

  app.module("Editor.Thumbnails", {
    init,
    setConfig,
    loadFrames,
    previus,
    next,
    setIndex
  });

})(APP);
