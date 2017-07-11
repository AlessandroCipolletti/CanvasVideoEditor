"use strict";

var APP = {};

APP.NAME = "APP";
APP.VERSION = "0.1";
APP.module = function (name, module) {

  var modules = name.split(".");
  var parent = APP;

  if (modules[0] === parent.NAME) {
    modules = modules.splice(1);
  }

  for (var i = 0, l = modules.length; i < l; i++) {
    if (i === l - 1) {
      if (typeof(parent[modules[i]]) === "undefined") {
        parent[modules[i]] = module;
      } else {
        for (var attr in module) {
          parent[modules[i]][attr] = module[attr];
        }
      }
    } else if (typeof(parent[modules[i]]) === "undefined") {
      parent[modules[i]] = {};
    }
    parent = parent[modules[i]];
  }

};

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    APP.Main.init({
      testDebug: true,
      version: APP.VERSION
    });
  }
};