/*
  Documentations:

*/
(function (app) {
  "use strict";
  // Dependencies
  var Param = {};
  var Utils = {};
  var Messages = {};
  var Editor = {};
  var Main = {};

  var _polyfills = [];
  var _config = {

  };

  var _captureMediaPopup = {}, _snapCtx = {}, _cameraStream = {};
  var _usingCamera = false, _isOpen = false, _captureModeVideo = false;

  function __showDoms (doms) {
    doms.forEach(function (dom) {
      dom.classList.remove("displayNone");
    });
  }

  function __hideDoms (doms) {
    doms.forEach(function (dom) {
      dom.classList.add("displayNone");
    });
  }

  function _startTakeVideo (e) {

    _captureModeVideo = true;
    __hideDoms([_captureMediaPopup.videoButton, _captureMediaPopup.cameraButton]);
    __showDoms([_captureMediaPopup.stopButton]);
    // TODO

  }

  function _stopTakeVideo (e) {

    __hideDoms([_captureMediaPopup.stopButton]);
    __showDoms([_captureMediaPopup.rejectButton, _captureMediaPopup.doneButton]);
    // TODO

  }

  function _takeCameraSnap (e) {

    _captureModeVideo = false;
    _captureMediaPopup.snap.width = _captureMediaPopup.preview.videoWidth;
    _captureMediaPopup.snap.height = _captureMediaPopup.preview.videoHeight;
    _snapCtx.drawImage(_captureMediaPopup.preview, 0, 0, _captureMediaPopup.snap.width, _captureMediaPopup.snap.height);
    __hideDoms([_captureMediaPopup.preview, _captureMediaPopup.videoButton, _captureMediaPopup.cameraButton]);
    __showDoms([_captureMediaPopup.snap, _captureMediaPopup.rejectButton, _captureMediaPopup.doneButton]);
    _closeCamera();

  }

  function _onRejectClick (e) {

    if (_captureModeVideo) {
      // TODO
    } else {
      __showDoms([_captureMediaPopup.preview]);
      __hideDoms([_captureMediaPopup.snap]);
      _captureMediaPopup.snap.width = _captureMediaPopup.snap.width;
    }
    __showDoms([_captureMediaPopup.videoButton, _captureMediaPopup.cameraButton]);
    __hideDoms([_captureMediaPopup.rejectButton, _captureMediaPopup.doneButton]);
    _openCamera();

  }

  function _onDoneClick (e) {

    if (_captureModeVideo) {
      // TODO
    } else {
      // Editor.addMedia(_captureMediaPopup.snap, "image");  // TODO
    }
    hide(true);

  }

  function _openCamera () {

    _usingCamera = true;
    navigator.getUserMedia({
      video: true,
      audio: true
    }, function (stream) {
      _cameraStream = stream;
      _captureMediaPopup.preview.src = URL.createObjectURL(stream);
    }, function (e) {
      console.log("error camera: ", e);
    });

  }

  function _closeCamera () {

    _usingCamera = false;
    _cameraStream.getTracks().forEach(function (track) {
      track.stop();
    });

  }

  function show () {

    if (_isOpen === false) {
      _isOpen = true;
      Messages.panel(_captureMediaPopup, true, {
        top: "50%",
        width: "60rem",
        height: "40rem"
      }, _openCamera, hide);
    }

  }

  function hide (closePanel) {

    _isOpen = false;
    _closeCamera();
    if (closePanel) {
      Messages.closePanel();
    }

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    Main.loadTemplate("captureMediaPopup", {}, Param.container, function (templateDom) {

      _captureMediaPopup = templateDom;
      _captureMediaPopup.parentNode.removeChild(_captureMediaPopup);
      _captureMediaPopup.preview = _captureMediaPopup.querySelector(".habillage-editor__capture-media-preview");
      _captureMediaPopup.snap = _captureMediaPopup.querySelector(".habillage-editor__capture-media-snap");
      _captureMediaPopup.videoButton = _captureMediaPopup.querySelector(".habillage-editor__capture-media-video");
      _captureMediaPopup.cameraButton = _captureMediaPopup.querySelector(".habillage-editor__capture-media-image");
      _captureMediaPopup.stopButton = _captureMediaPopup.querySelector(".habillage-editor__capture-media-stop");
      _captureMediaPopup.rejectButton = _captureMediaPopup.querySelector(".habillage-editor__capture-media-reject");
      _captureMediaPopup.doneButton = _captureMediaPopup.querySelector(".habillage-editor__capture-media-done");
      _captureMediaPopup.snap.width = 400 * Param.pixelRatio;
      _captureMediaPopup.snap.height = 300 * Param.pixelRatio;
      _snapCtx = _captureMediaPopup.snap.getContext("2d");
      _captureMediaPopup.videoButton.addEventListener(Param.eventStart, _startTakeVideo);
      _captureMediaPopup.cameraButton.addEventListener(Param.eventStart, _takeCameraSnap);
      _captureMediaPopup.doneButton.addEventListener(Param.eventStart, _onDoneClick);
      _captureMediaPopup.rejectButton.addEventListener(Param.eventStart, _onRejectClick);
      _captureMediaPopup.stopButton.addEventListener(Param.eventStart, _stopTakeVideo);
      // Main.addRotationHandler(_onRotate);

    });

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Messages = app.Messages;
    Editor = app.Editor;
    Main = app.Main;
    _config = Utils.setConfig(params, _config);
    Utils.initWithPolyfills(_polyfills, _initDom);

  }

  app.module("CaptureMediaPopup", {
    init,
    show,
    hide
  });

})(APP);
