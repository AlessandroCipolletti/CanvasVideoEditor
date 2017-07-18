/*
  Documentations:

*/
(function (app) {
  "use strict";
  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};

  var _config = {
    autoCloseDelay: 2500
  };

  // TODO ovviamente tutti possono anche interagire con tastiera, invio ed escape
  // TODO input

  var _dom = {}, _overlay = {}, _message = {}, _confirmButton = {}, _cancelButton = {}, _panel = {}, _panelClose = {};
  var _stack = [];
  var _isOpen = false, _autoCloseTimeout = false, _panelIsOpen = false, _currentIsMandatory = false, _callbackClosePanel = false;

  function _setType (type) {

    _resetType();
    _dom.classList.add("habillage-messages__container-" + type);

  }

  function _resetType () {

    _dom.classList.remove(
      "habillage-messages__container-success",
      "habillage-messages__container-error",
      "habillage-messages__container-info",
      "habillage-messages__container-alert",
      "habillage-messages__container-confirm",
      "habillage-messages__container-input"
    );

  }

  function _show (mandatory) {

    _isOpen = true;
    _currentIsMandatory = mandatory;
    Utils.addGlobalStatus("habillage__MESSAGE-OPEN");
    if (mandatory) {
      Utils.addGlobalStatus("habillage__MESSAGE-MANDATORY-OPEN");
      Utils.fadeInElements(_overlay);
    } else {
      _autoCloseTimeout = setTimeout(_hide, _config.autoCloseDelay);
    }

  }

  function _hide (blockStack) {

    _isOpen = false;
    Utils.removeGlobalStatus("habillage__MESSAGE-OPEN");
    if (_currentIsMandatory) {
      Utils.removeGlobalStatus("habillage__MESSAGE-MANDATORY-OPEN");
      Utils.fadeOutElements(_overlay);
      _currentIsMandatory = false;
    }
    if (_autoCloseTimeout) {
      clearTimeout(_autoCloseTimeout);
      _autoCloseTimeout = false;
    }
    if (!blockStack) {
      setTimeout(_onHide, 200);
    }

  }

  function _onHide () {

    var message = _stack.splice(0, 1)[0];
    if (message) {
      if (message.type === "input" || message.type === "confirm") {
        app.Messages[message.type](message.msg, message.mandatory, message.onConfirm, message.onCancel);
      } else {
        app.Messages[message.type](message.msg);
      }
    }

  }

  function _makeMessage (type, msg, mandatory) {

    if (_isOpen) {
      _stack.push({
        type: type,
        msg: msg,
        mandatory: mandatory
      });
    } else {
      _setType(type);
      _message.innerHTML = msg;
      setTimeout(function () {
        _show(mandatory);
      }, 16);
    }

  }

  function _onButtonClick (callback) {

    _hide();
    if (callback) {
      callback();
    }

  }

  function _removeAllListeners (button) {

    var newButton = button.cloneNode(true);
    button.parentNode.appendChild(newButton);
    button.parentNode.removeChild(button);
    return newButton;

  }

  function alert (msg, _callback) {

    if (_isOpen) {
      _hide(true);
    }
    _confirmButton = _removeAllListeners(_confirmButton);
    _confirmButton.addEventListener(Param.eventStart, _onButtonClick.bind({}, _callback));
    _makeMessage("alert", msg, true);

  }

  function info (msg) {
    _makeMessage("info", msg, false);
  }

  function success (msg) {
    _makeMessage("success", msg, false);
  }

  function error (msg) {
    _makeMessage("error", msg, false);
  }

  function confirm (msg, mandatory, onConfirm, onCancel) {

    mandatory = (typeof(mandatory) === "undefined" ? true : mandatory);
    if (_isOpen) {
      _hide(true);
    }
    _cancelButton = _removeAllListeners(_cancelButton);
    _confirmButton = _removeAllListeners(_confirmButton);
    _confirmButton.addEventListener(Param.eventStart, _onButtonClick.bind({}, onConfirm));
    _cancelButton.addEventListener(Param.eventStart, _onButtonClick.bind({}, onCancel));
    _makeMessage("confirm", msg, mandatory);

  }

  function input (msg, mandatory, onConfirm, onCancel) {

    _setType("input");
    mandatory = (typeOf(mandatory) === "undefined" ? false : mandatory);

  }

  function closePanel (callback) {

    if (_panelIsOpen) {
      Utils.fadeOutElements([_panel, _overlay], [callback, undefined]);
      _panelIsOpen = false;
    }

  }

  function panel (content, force, styles, callbackOpen, callbackClose) {

    _callbackClosePanel = callbackClose || false;
    if (force || _panelIsOpen === false) {
      content.classList.add("habillage-panel-content");
      if (styles) {
        _panel.style = "";
        for (var k in styles) {
          _panel.style[k] = styles[k];
        }
      }
      _panel.innerHTML = "";
      // _panel.appendChild(_panelClose);
      _panel.appendChild(content);
      if (_panelIsOpen === false) {
        Utils.fadeInElements([_panel, _overlay], [callbackOpen, undefined]);
      } else if (callbackOpen) {
        setTimeout(callbackOpen, Param.fadeTransition);
      }
      _panelIsOpen = true;
    }

  }

  function _panelCloseClick (e) {

    e.preventDefault();
    if (_panelIsOpen) {
      Utils.fadeOutElements([_panel, _overlay]);
      _panelIsOpen = false;
    } else {
      _panelIsOpen = true;
    }

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    Main.loadTemplate("messages", {
      labelOk: "Ok",
      labelCancel: "Cancel"
    }, Param.container, function (templateDom) {

      _overlay = document.querySelector(".habillage-messages__overlay");
      _dom = document.querySelector(".habillage-messages__container");
      _message = _dom.querySelector(".habillage-messages__container-text");
      _confirmButton = _dom.querySelector(".habillage-messages__container-button-ok");
      _cancelButton = _dom.querySelector(".habillage-messages__container-button-cancel");
      _panel = document.querySelector(".habillage-messages__panel");
      _panelClose = _panel.querySelector(".habillage-messages__panel-close");
      _panelClose.addEventListener(Param.eventStart, _panelCloseClick);
      _overlay.addEventListener(Param.eventStart, function (e) {
        e.preventDefault();
        closePanel(_callbackClosePanel);
      });
      Main.addRotationHandler(_onRotate);

    });

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    _config = Utils.setConfig(params, _config);
    _initDom();

  }

  app.module("Messages", {
    init,
    alert,
    info,
    success,
    error,
    confirm,
    input,
    panel,
    closePanel
  });

})(APP);
