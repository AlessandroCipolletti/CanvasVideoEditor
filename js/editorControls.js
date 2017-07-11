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
  var Thumbnails = {};

  var _config = {
    duration: 30
  };

  var _slider = {}, _cursor = {}, _tooltip = {}, _value = {};
  var _currentTime = 0, _maxWidth = 0, _minCursorPosition = 0;
  var _touchDown = false, _videoLoaded = false, _isLoading = false;

  function setTime (time) {
    _currentTime = time;
    _updateSlider(_getPositionFromTime(time));
  }

  function _drag (x) {

    setTime(_getTimeFromPosition(MATH.min(MATH.max(x -= _minCursorPosition, 0), _maxWidth)));
    Editor.setByTime(_currentTime);
    _isLoading = false;

  }

  function _getPositionFromTime (time) {
    return MATH.min(MATH.max(Utils.round(_maxWidth * time / _config.duration, 3), 0), _maxWidth);
  }

  function _getTimeFromPosition (x) {
    // TODO prendere non il tempo precisamente per il px dove ti trovi, ma per il frame col time più vicino
    return MATH.min(MATH.max(Utils.round(x / _maxWidth * _config.duration, 3), 0), _config.duration);
  }

  function _formatValueTime (value) {
    return MATH.trunc(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + (MATH.round((value % 60) * 100) / 100).toFixed(2);
  }

  function _updateSlider (x) {
    _cursor.style.left = x + "px";
    _value.innerHTML = _formatValueTime(_currentTime);
  }

  function _initSlider () {
    _tooltip.classList.remove("displayNone");
  }

  function _onTouchStart (e) {

    Utils.preventDefault(e);
    if (_videoLoaded) {
      _touchDown = true;
      document.addEventListener(Param.eventMove, _onTouchMove, true);
      document.addEventListener(Param.eventEnd, _onTouchEnd, true);
    }

  }

  function _onTouchMove (e) {

    Utils.preventDefault(e);
    if (_touchDown && !_isLoading) {
      _isLoading = true;
      var touches = Utils.filterTouchesByTarget(e);
      _drag(touches[0].clientX);
    }

  }

  function _onTouchEnd (e) {

    Utils.preventDefault(e);
    _touchDown = false;
    document.removeEventListener(Param.eventMove, _onTouchMove);
    document.removeEventListener(Param.eventEnd, _onTouchEnd);

  }

  function setConfig (params) {

    _config = Utils.setConfig(params, _config);
    if (_config.duration > 0) {
      _videoLoaded = true;
      _initSlider();
    }

  }

  function _calculeSliderMaxMin () {

    var rect = _slider.getBoundingClientRect();
    _maxWidth = MATH.round(rect.width - ((4 + 10 + 20) * Param.pixelRatio));
    _minCursorPosition = MATH.round(rect.left + ((2 + 5 + 10) * Param.pixelRatio));

  }

  function _onRotate (e) {

    _calculeSliderMaxMin();
    if (_config.duration) {
      _updateSlider();
    }

  }

  function _initDom (moduleContainer) {

    Main.loadTemplate("editorControls", {}, moduleContainer, function (templateDom) {

      _slider = templateDom;
      _cursor = _slider.querySelector(".habillage-editor__controls-slider-cursor");
      _tooltip = _slider.querySelector(".habillage-editor__controls-slider-cursor-tooltip");
      _value = _slider.querySelector(".habillage-editor__controls-slider-cursor-tooltip-value");
      _cursor.addEventListener(Param.eventStart, _onTouchStart, true);
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
    Thumbnails = app.Editor.Thumbnails;
    _config = Utils.setConfig(params, _config);
    _initDom(moduleContainer);

  }

  app.module("Editor.Controls", {
    init,
    setConfig,
    setTime
  });

})(APP);
