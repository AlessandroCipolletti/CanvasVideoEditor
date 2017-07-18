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
  var CaptureMediaPopup = {};

  var _polyfills = [];
  var _config = {
    fps: 2,
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

  var _container = {}, _input = {}, _videoSpinner = {}, _previewContainer = {}, _controlsContainer = {}, _thumbnailsContainer = {}, _overlayMessage = {}, _progressbar = {}, _progressbarValue = {}, _addMediaButton = {}, _addMediaPopup = {};

  var _captureMediaPopup = {};

  var _video = document.createElement('video'), _duration = 0;
  var _frames = [], _framesNumber = 0, _currentFrameIndex = 0;
  var _startTaskTime = 0;
  var _videoLoaded = false, _toolIsWorking = false, _keyPressed = false, _isLoading = false;

  function _findFrameIndexByTime (time) {
    return MATH.min(MATH.max(MATH.round(time / _config.duration * _framesNumber), 0), _framesNumber - 1);
  }

  function _toolCallback (done) {

    _toolIsWorking = false;
    setLoading(false);
    if (done) {
      Messages.success("Tool done !");
      Preview.setFrame(_frames[_currentFrameIndex], true);
      Thumbnails.setIndex(_currentFrameIndex, true);
    }

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

    _isLoading = loading;
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

    if (_video) {
      var hd = document.createElement("canvas");
      var time = Utils.round(_video.currentTime, 3);
      hd.width = _config.resolution.w;
      hd.height = _config.resolution.h;
      hd.getContext("2d").drawImage(_video, 0, 0, hd.width, hd.height);
      setProgressbar(MATH.round(_video.currentTime * 100 / _video.duration));
      _frames.push({
        time: time,
        canvas: hd,
        index: _frames.length
      });
      // setTimeout(_saveFrame, 1000 / _config.fps);
    }

  }

  var _loadFramesSure = (function () {

    var currentTime = 0;
    var onVideoSeek = function (e) {

      currentTime = _video.currentTime;
      _saveFrame();
      if (currentTime + (1 / _config.fps) <= _config.duration) {
        _video.currentTime = currentTime + (1 / _config.fps);
      } else {
        _importCallback();
      }

    };

    return function () {

      _frames = [];
      //*
      _video.addEventListener("seeked", onVideoSeek);
      _video.currentTime = 0;
      /*/
      _video.addEventListener("timeupdate", _saveFrame);
      _video.addEventListener("ended", _importCallback);
      _video.currentTime = 0;
      _video.muted = true;
      _video.play();
      //*/

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
    setTimeout(_saveFrame, 1000 / _config.fps);

  }

  function _onSelectVideo () {

    if (this.files && this.files[0]) {
      Messages.closePanel();
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

  function _setInput (e) {

    if (e.target.nodeName.toLowerCase() === "img") {
      var type = e.target.parentNode.className;
      type = type.substr(type.lastIndexOf("-") + 1, type.length);
      if (type === "video") {
        _input.setAttribute("accept", "video/*");
        _input.click();
      } else if (type === "audio") {
        _input.setAttribute("accept", "audio/mp3");
        _input.click();
      } else if (type === "image") {
        _input.setAttribute("accept", "image/*");
        _input.click();
      } else if (type === "micro") {
        Messages.info("TODO");
      } else if (type === "camera") {

        CaptureMediaPopup.show();

      }

    }

  }

  function _addMediaButtonClick (e) {

    Messages.panel(_addMediaPopup, false, {
      top: "40%",
      width: "60rem",
      height: "16rem"
    });

  }

  function _onKeyUp (e) {
    _keyPressed = false;
  }

  function __onKeypress () {
    _keyPressed = false;
  }

  function _onKeyDown (e) {

    if (_isLoading === false && _videoLoaded && _keyPressed === false && (e.keyCode === 37 || e.keyCode === 39)) {
      _keyPressed = true;
      if (e.keyCode === 37) {
        Thumbnails.previus();
      } else {
        Thumbnails.next();
      }
      // setTimeout(__onKeypress, 75);
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
      marginTop: Param.headerSize,
      importLabel: "Import",
      captureLabel: "Capture"
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

      _addMediaButton = _container.querySelector(".habillage-editor__add-media-button");
      _addMediaButton.addEventListener(Param.eventStart, _addMediaButtonClick);
      _addMediaPopup = _container.querySelector(".habillage-editor__add-media-popup");
      _addMediaPopup.parentNode.removeChild(_addMediaPopup);
      _addMediaPopup.addEventListener(Param.eventStart, _setInput, true);

      document.addEventListener("keydown", _onKeyDown);
      document.addEventListener("keyup", _onKeyUp);
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
    CaptureMediaPopup = app.CaptureMediaPopup;
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
