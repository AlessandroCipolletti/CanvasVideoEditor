(function (app) {
  "use strict";
  // Dependencies
  var MATH = Math;
  var Editor = {};

  var abs = MATH.abs, pow = MATH.pow;
  var _frames = [], _canvasWidth = 0, _canvasHeight = 0, _context = {}, _callback = {}, _startTime = 0, _index = 0, _framesNumber = 0,  _targetColor = [], _coordX = 0, _coordY = 0;

  var __doWork = function (doFrame) {

    if (_index < _framesNumber) {
      requestAnimationFrame(__doWork);
      _context = _frames[_index].canvas.getContext("2d");
      doFrame();
      _index++;
      Editor.setProgressbar(MATH.round(_index * 100 / _framesNumber));
    } else {
      console.log("ChromaKey effect in", new Date().getTime() - _startTime, "ms");
      _callback && _callback();
    }

  };

  var _doWork = function (doFrame, fs, x, y, currentFrameIndex, cb) {

    _frames = fs;
    _callback = cb;
    _framesNumber = fs.length;
    _coordX = x;
    _coordY = y;
    _index = 0;
    _startTime = new Date().getTime();
    var currentCanvas = _frames[currentFrameIndex].canvas;
    _canvasWidth = currentCanvas.width;
    _canvasHeight = currentCanvas.height;

    var data = currentCanvas.getContext("2d").getImageData(0, 0, _canvasWidth, _canvasHeight).data;
    var px = (MATH.floor(x) + MATH.floor(y) * _canvasWidth) * 4;
    _targetColor = [data[px], data[px + 1], data[px + 2], data[px + 3]];

    __doWork = __doWork.bind({}, doFrame);
    __doWork();

  };

  var cippo = (function () {

    var doFrame = (function () {

      var tolerance = 50;
      var pixelCompare = function (i, _targetColor, fillcolor, data, length, tolerance) {
      	if (i < 0 || i >= length) return false; //out of bounds
      	if (
      		abs(_targetColor[3] - data[i + 3]) <= (255 - tolerance) &&
      		abs(_targetColor[0] - data[i]) <= tolerance &&
      		abs(_targetColor[1] - data[i + 1]) <= tolerance &&
      		abs(_targetColor[2] - data[i + 2]) <= tolerance
      	) return true; //target to surface within tolerance
      	return false; //no match
      };

      var pixelCompareAndSet = function (i, _targetColor, fillcolor, data, length, tolerance) {
      	if(pixelCompare(i, _targetColor, fillcolor, data, length, tolerance)) {
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

      return function () {

        var targetColor = _targetColor;
        var canvasWidth = _canvasWidth;
        var fillcolor = {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        };
        // TODO use Uint32Array for performance like chroma
        image = _context.getImageData(0, 0, canvasWidth, _canvasHeight);
        data = image.data;
        length = data.length;
      	Q = [];
      	e = w = i = (MATH.floor(_coordX) + MATH.floor(_coordY) * canvasWidth) * 4;
        w2 = canvasWidth * 4;

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
        _context.putImageData(image, 0, 0);

      };

    })();

    return _doWork.bind({}, doFrame);

  })();

  var chroma = (function () {

    var dE76 = function (a, b, c, d, e, f) {
      return MATH.sqrt(pow(d - a, 2) + pow(e - b, 2) + pow(f - c, 2))
    };
    var imageData, data32, clampedArray;

    var rgbToLab = function (r, g, b) {
      var xyz = rgbToXyz(r, g, b);
      return xyzToLab(xyz[0], xyz[1], xyz[2]);
    };

    var rgbToXyz = function (r, g, b) {
      var _r = (r / 255);
      var _g = (g / 255);
      var _b = (b / 255);

      if (_r > 0.04045) {
        _r = pow(((_r + 0.055) / 1.055), 2.4);
      }
      else {
        _r = _r / 12.92;
      }
      if (_g > 0.04045) {
        _g = pow(((_g + 0.055) / 1.055), 2.4);
      }
      else {
        _g = _g / 12.92;
      }
      if (_b > 0.04045) {
        _b = pow(((_b + 0.055) / 1.055), 2.4);
      }
      else {
        _b = _b / 12.92;
      }

      _r = _r * 100;
      _g = _g * 100;
      _b = _b * 100;

      return [
        _r * 0.4124 + _g * 0.3576 + _b * 0.1805,
        _r * 0.2126 + _g * 0.7152 + _b * 0.0722,
        _r * 0.0193 + _g * 0.1192 + _b * 0.9505
      ];
    };

    var xyzToLab = function (x, y, z) {
      var ref_X = 95.047;
      var ref_Y = 100.000;
      var ref_Z = 108.883;
      var _X = x / ref_X;
      var _Y = y / ref_Y;
      var _Z = z / ref_Z;

      if (_X > 0.008856) {
        _X = MATH.pow(_X, (1 / 3));
      }
      else {
        _X = (7.787 * _X) + (16 / 116);
      }
      if (_Y > 0.008856) {
        _Y = MATH.pow(_Y, (1 / 3));
      }
      else {
        _Y = (7.787 * _Y) + (16 / 116);
      }
      if (_Z > 0.008856) {
        _Z = MATH.pow(_Z, (1 / 3));
      }
      else {
        _Z = (7.787 * _Z) + (16 / 116);
      }

      return [
        (116 * _Y) - 16,
        500 * (_X - _Y),
        200 * (_Y - _Z)
      ];
    };

    var doFrame = function () {
      // use Uint32Array for performance
      var r, g, b, labColor, pixel;
      imageData = _context.getImageData(0, 0, _canvasWidth, _canvasHeight);
      data32 = new Uint32Array(imageData.data.buffer);
      clampedArray = new Uint8ClampedArray(data32.buffer)
      for (var i = _canvasWidth * _canvasHeight; i--; ) {
        pixel = data32[i];
        r = (pixel) & 0xff;
        g = (pixel >> 8) & 0xff;
        b = (pixel >> 16) & 0xff;
        labColor = rgbToLab(r, g, b); // very slow
        if (
          dE76(labColor[0], labColor[1], labColor[2], 89, -99, 79) < 70 || // test light green
          dE76(labColor[0], labColor[1], labColor[2], 44, -40, 43) < 24 || // test dark green
          dE76(labColor[0], labColor[1], labColor[2], 68, -43, 53) < 13    // test middle green
        ) {
          data32[i] = 0;
        }
      }
      imageData.data.set(clampedArray);
      _context.putImageData(imageData, 0, 0);
    };

    return _doWork.bind({}, doFrame);

  })();

  var dog = (function () {

    var imageData, resultData, imageData32, resultData32, r, g, b, a, tolerance = 70;

    var doFrame = function () {

      var pixel;
      imageData = _context.getImageData(0, 0, _canvasWidth, _canvasHeight);
      imageData32 = new Uint32Array(imageData.data.buffer);
      resultData = _context.createImageData(_canvasWidth, _canvasHeight);
      resultData32 = new Uint32Array(resultData.data.buffer);
      for (var i = _canvasWidth * _canvasHeight; i--; ) {
        pixel = imageData32[i];
        r = pixel & 0xff;
        g = (pixel >> 8) & 0xff;
        b = (pixel >> 16) & 0xff;
        a = (pixel >> 24) & 0xff;
        if (
      		abs(_targetColor[0] - r) > tolerance ||
      		abs(_targetColor[1] - g) > tolerance ||
      		abs(_targetColor[2] - b) > tolerance
          // || abs(_targetColor[3] - a) > tolerance
      	) {
          resultData32[i] = r | g << 8 | b << 16 | a << 24;
        }
      }
      resultData.data.set(new Uint8ClampedArray(resultData32.buffer));
      _context.putImageData(resultData, 0, 0);

    };

    return _doWork.bind({}, doFrame);

  })();

  function init () {
    Editor = app.Editor;
  }

  app.module("Tools.Bucket", {
    init,
    cippo,
    chroma,
    dog
  });

})(APP);
