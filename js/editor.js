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
  var Messages = {};
  var Preview = {};
  var Controls = {};
  var Thumbnails = {};
  var Tools = {};

  var _polyfills = [];
  var _config = {
    fps: 1,
    duration: 0,
    importMode: "sure", // sure or fast
    backgroundToolMode: "dog", // cippo or chroma or dog
    previewWidth: 800,
    previewHeight: 450,
    resolution: {   // selected video resolution, to update onload
      w: 640,
      h: 360
    }
  };

  var _container = {}, _input = {}, _videoSpinner = {}, _previewContainer = {}, _controlsContainer = {}, _thumbnailsContainer = {}, _overlayMessage = {}, _progressbar = {}, _progressbarValue = {};
  var _video = document.createElement('video'), _duration = 0;
  var _frames = [], _framesNumber = 0, _currentFrameIndex = 0;
  var _startTaskTime = 0;
  var _videoLoaded = false, _toolIsWorking = false, _keyPressed = false;

  function _findFrameIndexByTime (time) {
    return MATH.min(MATH.max(MATH.round(time / _config.duration * _framesNumber), 0), _framesNumber - 1);
  }

  function _toolCallback () {

    _toolIsWorking = false;
    setLoading(false);
    Messages.success("Tool done !");
    Preview.setFrame(_frames[_currentFrameIndex], true);
    Thumbnails.setIndex(_currentFrameIndex, true);

  }

  function previewClick (x, y) {

    if (_videoLoaded) {
      _toolIsWorking = true;
      var fn = Tools.Bucket[_config.backgroundToolMode];
      setLoading(true, true, "Bucket...", fn.bind.apply(fn, [{}].concat([_frames, x, y, _currentFrameIndex, _toolCallback])));
    }

  }

  function setByTime (time) {

    _currentFrameIndex = _findFrameIndexByTime(time);
    Preview.setFrame(_frames[_currentFrameIndex]);
    Thumbnails.setIndex(_currentFrameIndex);

  }

  function setByFrame (frameIndex) {

    _currentFrameIndex = frameIndex;
    Preview.setFrame(_frames[frameIndex]);
    Controls.setTime(_frames[frameIndex].time);

  }

  var setProgressbar = (function () {
    var currentValue = 0;
    return function (value) {
      if (value !== currentValue) {
        _progressbarValue.style.width = value + "%";
        currentValue = value;
      }
    }
  })();

  function setLoading(loading, progressbar, message, callback) {

    if (loading) {
      _overlayMessage.innerHTML = message || "";
      if (progressbar) {
        setProgressbar(0);
        _progressbar.classList.remove("displayNone");
      }
      Utils.fadeInElements(_videoSpinner, callback);
    } else {
      _progressbar.classList.add("displayNone");
      Utils.fadeOutElements(_videoSpinner, callback);
    }

  }

  function _importCallback () {

    Preview.setConfig(_config);
    Preview.setFrame(_frames[0]);
    Controls.setConfig(_config);
    Controls.setTime(0);
    Thumbnails.setConfig(_config);
    Thumbnails.loadFrames(_frames);
    Thumbnails.setIndex(0);
    _videoLoaded = true;
    _video = undefined;
    setLoading(false);
    Messages.success("Video successfully loaded!");
    _framesNumber = _frames.length;
    console.log(_framesNumber, " frames in ", new Date().getTime() - _startTaskTime, "ms");

  }

  function _saveFrame () {

    var hd = document.createElement("canvas");
    var time = Utils.round(_video.currentTime, 3);
    hd.width = _config.resolution.w;
    hd.height = _config.resolution.h;
    hd.getContext("2d").drawImage(_video, 0, 0, hd.width, hd.height);
    _frames.push({
      time: time,
      canvas: hd,
      index: _frames.length
    });

  }

  var _loadFramesSure = (function () {

    var currentTime = 0;
    var onVideoSeek = function (e) {

      currentTime = _video.currentTime;
      _saveFrame();
      setProgressbar(MATH.round(currentTime * 100 / _config.duration));
      if (currentTime + (1 / _config.fps) <= _config.duration) {
        _video.currentTime = currentTime + (1 / _config.fps);
      } else {
        _importCallback();
      }

    };

    return function () {

      _frames = [];
      _video.addEventListener("seeked", onVideoSeek);
      _video.currentTime = 0;

    };

  })();

  function _loadFramesFast () {

    _video.currentTime = 0;
    _video.muted = true;
    _frames = [];
    _saveFrame();
    _video.addEventListener("ended", function () {
      // filtro i valori per non avere troppi frames
      // poi:
      _importCallback()
    });
    _video.play();
    requestAnimationFrame(_saveFrame);

  }

  function _onSelectVideo () {

    if (this.files && this.files[0]) {
      setLoading(true, true, "Importing video...");
      var file = this.files[0];
      var url = URL.createObjectURL(file);
      _video.src = url;
      // var reader = new FileReader();
      // reader.onload = function() {
      //   _video.src = this.result;
      // }
      // reader.readAsDataURL(file);
    }

  }

  function _onVideoLoad () {

    _config.resolution.w = _video.videoWidth;
    _config.resolution.h = _video.videoHeight;
    _config.duration = _video.duration;
    // TODO gerer autres formats que 16/9
    _input.classList.add("displayNone");
    _startTaskTime = new Date().getTime();
    if (_config.importMode === "sure") {
      _loadFramesSure();
    } else {
      _loadFramesFast()
    }

  }

  function __onKeypress () {
    _keyPressed = false;
  }

  function _onKeypress (e) {

    if (_keyPressed === false && (e.keyCode === 37 || e.keyCode === 39)) {
      _keyPressed = true;
      if (e.keyCode === 37) {
        Thumbnails.previus();
      } else {
        Thumbnails.next();
      }
      requestAnimationFrame(__onKeypress);
    }

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initSubModules () {

    Tools.Bucket.init();
    Preview.init(_config, _previewContainer);
    Controls.init(_config, _controlsContainer);
    Thumbnails.init(_config, _thumbnailsContainer);

  }

  function _initDom () {

    Main.loadTemplate("editor", {
      marginTop: Param.headerSize
    }, Param.container, function (templateDom) {

      _container = templateDom;
      _previewContainer = _container.querySelector(".habillage-editor__preview-container");
      _controlsContainer = _container.querySelector(".habillage-editor__controls-container");
      _thumbnailsContainer = _container.querySelector(".habillage-editor__thumbnails-container");
      _videoSpinner = _container.querySelector(".habillage-editor__overlay");
      _input = _container.querySelector("input");
      _overlayMessage = _container.querySelector(".habillage-editor__overlay-message");
      _progressbar = _container.querySelector(".habillage-editor__progressbar");
      _progressbarValue = _container.querySelector(".habillage-editor__progressbar-value");
      document.addEventListener("keydown", _onKeypress);
      _input.addEventListener("change", _onSelectVideo);
      _video.addEventListener("loadeddata", _onVideoLoad);
      _controlsContainer.style.width = _config.previewWidth + "px";
      _controlsContainer.style.top = _config.previewHeight + "px";
      _previewContainer.style.width = _config.previewWidth + "px";
      _previewContainer.style.height = _config.previewHeight + "px";
      _video.crossOrigin = "Anonymous";
      Utils.preventAllDefault(_videoSpinner);
      _initSubModules();
      // Main.addRotationHandler(_onRotate);

    });

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Messages = app.Messages;
    Tools = app.Tools;
    Preview = app.Editor.Preview;
    Controls = app.Editor.Controls;
    Thumbnails = app.Editor.Thumbnails;
    _config = Utils.setConfig(params, _config);
    Utils.initWithPolyfills(_polyfills, _initDom);

  }

  app.module("Editor", {
    init,
    setLoading,
    setProgressbar,
    setByTime,
    setByFrame,
    previewClick
  });

})(APP);
