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

  var _polyfills = [];
  var _config = {
    fps: 1,
    duration: 0,
    importMode: "sure", // sure or fast
    previewWidth: 640,
    previewHeight: 360,
    resolution: {   // selected video resolution, to update onload
      w: 640,
      h: 480
    }
  };

  var _container = {}, _input = {}, _bucketCanvas = {}, _bucketContext = {}, _videoSpinner = {}, _previewContainer = {}, _controlsContainer = {}, _thumbnailsContainer = {}, _overlayMessage = {}, _progressbar = {}, _progressbarValue = {};
  var _video = document.createElement('video'), _duration = 0;
  var _frames = [], _framesLD = [], _framesNumber = 0;
  var _startImportTime = 0;
  var _videoLoaded = false, _bucketIsWorking = false, _keyPressed = false;

  var _bucketVideo = (function () {

    var currentTime = 0;
    var _frames = [];
    var saveNewBlob = function (blob) {
      _frames.push(blob);
    };
    var onVideoSeek = function (x, y, targetColor, e) {

      console.log("seeked", _video.currentTime);
      currentTime = _video.currentTime;
      _bucketContext.clearRect(0, 0, _bucketCanvas.width, _bucketCanvas.height);
      _bucketContext.drawImage(_video, 0, 0, _bucketCanvas.width, _bucketCanvas.height);
      _bucketFrame(_bucketContext, x, y, targetColor);

      output.add(_bucketCanvas);

      _bucketCanvas.toBlob(saveNewBlob, "image/png");

      if (currentTime + (1 / _config.fps) <= _config.duration) {
        _video.currentTime = currentTime + (1 / _config.fps);
      } else {
        _video.removeEventListener("seeked", onVideoSeek);

        _context.clearRect(0, 0, _canvas.width, _canvas.height);
        _context.drawImage(_bucketCanvas, 0, 0, _canvas.width, _canvas.height);

        window.frames = _frames;
        console.log(URL.createObjectURL(output));

        _bucketIsWorking = false;
        setLoading(false);
      }

    };

    return function (x, y) {

      _bucketIsWorking = true;
      var data = _context.getImageData(0, 0, _canvasWidth, _canvasHeight).data;
      var px = (MATH.floor(x) + MATH.floor(y) * _canvasWidth) * 4;
      var targetColor = [data[px], data[px + 1], data[px + 2], data[px + 3]];
      onVideoSeek = onVideoSeek.bind({}, x, y, targetColor);
      _video.currentTime = 0;
      _video.addEventListener("seeked", onVideoSeek);
      onVideoSeek();

    };

  })();

  var _bucketFrame = (function () {

    var tolerance = 50;
    var pixelCompare = function (i, targetColor, fillcolor, data, length, tolerance) {
    	if (i < 0 || i >= length) return false; //out of bounds
    	if (data[i + 3] === 0 && fillcolor.a > 0) return (targetColor[3] === 0);  //surface is invisible and fill is visible

    	if (
    		MATH.abs(targetColor[3] - fillcolor.a) <= tolerance &&
    		MATH.abs(targetColor[0] - fillcolor.r) <= tolerance &&
    		MATH.abs(targetColor[1] - fillcolor.g) <= tolerance &&
    		MATH.abs(targetColor[2] - fillcolor.b) <= tolerance
    	) return false; //target is same as fill

    	if (
    		(targetColor[3] === data[i + 3]) &&
    		(targetColor[0] === data[i]) &&
    		(targetColor[1] === data[i + 1]) &&
    		(targetColor[2] === data[i + 2])
    	) return true; //target matches surface

    	if (
    		MATH.abs(targetColor[3] - data[i + 3]) <= (255 - tolerance) &&
    		MATH.abs(targetColor[0] - data[i]) <= tolerance &&
    		MATH.abs(targetColor[1] - data[i + 1]) <= tolerance &&
    		MATH.abs(targetColor[2] - data[i + 2]) <= tolerance
    	) return true; //target to surface within tolerance

    	return false; //no match
    };

    var pixelCompareAndSet = function (i, targetColor, fillcolor, data, length, tolerance) {
    	if(pixelCompare(i, targetColor, fillcolor, data, length, tolerance)) {
    		//fill the color
    		data[i]   = fillcolor.r;
    		data[i+1] = fillcolor.g;
    		data[i+2] = fillcolor.b;
    		data[i+3] = fillcolor.a;
    		return true;
    	}
    	return false;
    };

    var image, data, length, Q, i, e, w, me, mw, w2;

    return function (context, x, y, targetColor) {

      var fillcolor = {
        r: 0,
        g: 0,
        b: 0,
        a: 0
      };
      image = context.getImageData(0, 0, _canvasWidth, _canvasHeight);
      data = image.data;
      length = data.length;
    	Q = [];
    	e = w = i = (MATH.floor(x) + MATH.floor(y) * _canvasWidth) * 4;
      w2 = _canvasWidth * 4;

    	if(!pixelCompare(i, targetColor, fillcolor, data, length, tolerance)) { return false; }
    	Q.push(i);
    	while(Q.length) {
        // console.log("a");
    		i = Q.pop();
    		if (pixelCompareAndSet(i, targetColor, fillcolor, data, length, tolerance)) {
    			e = w = i;
    			mw = parseInt(i / w2) * w2;  //left bound
    			me = mw + w2;  //right bound
    			while (mw < w && mw < (w -= 4) && pixelCompareAndSet(w, targetColor, fillcolor, data, length, tolerance)); //go left until edge hit
    			while (me > e && me > (e += 4) && pixelCompareAndSet(e, targetColor, fillcolor, data, length, tolerance)); //go right until edge hit
    			for (var j = w; j < e; j += 4) {
    				if (j - w2 >= 0     && pixelCompare(j - w2, targetColor, fillcolor, data, length, tolerance)) Q.push(j - w2); //queue y-1
    				if (j + w2 < length && pixelCompare(j + w2, targetColor, fillcolor, data, length, tolerance)) Q.push(j + w2); //queue y+1
    			}
    		}
    	}
      context.putImageData(image, 0, 0);

    };

  })();

  function _findFrameIndexByTime (time) {
    return MATH.min(MATH.max(MATH.round(time / _config.duration * _framesNumber), 0), _framesNumber - 1);
  }

  function setByTime (time) {

    var index = _findFrameIndexByTime(time);
    Preview.setFrame(_frames[index]);
    Thumbnails.setIndex(index);

  }

  function setByFrame (frameIndex) {
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

  function setLoading(loading, progressbar, message) {

    if (loading) {
      _overlayMessage.innerHTML = message || "";
      if (progressbar) {
        setProgressbar(0);
        _progressbar.classList.remove("displayNone");
      }
      Utils.fadeInElements(_videoSpinner);
    } else {
      _progressbar.classList.add("displayNone");
      Utils.fadeOutElements(_videoSpinner);
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
    console.log(_framesNumber + " frames");
    console.log(new Date().getTime() - _startImportTime);

  }

  function _saveFrame () {

    var hd = document.createElement("canvas");
    var time = Utils.round(_video.currentTime, 3);
    hd.width = _config.resolution.w;
    hd.height = _config.resolution.h;
    hd.getContext("2d").drawImage(_video, 0, 0, hd.width, hd.height);
    _frames.push({
      time: time,
      data: hd,
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
    _startImportTime = new Date().getTime();
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
      // _bucketCanvas = document.createElement("canvas");
      // _bucketContext = _bucketCanvas.getContext("2d");
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
    setByFrame
  });

})(APP);
