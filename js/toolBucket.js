(function (app) {
  "use strict";
  // Dependencies
  var MATH = Math;
  var Editor = {};

  var _frames = [], _canvasWidth = 0, _canvasHeight = 0, _context = {}, _callback = {}, _startTime = 0, _index = 0, _framesNumber = 0;

  var _doWork = function (doFrame) {

    if (_index < _framesNumber) {
      _context = _frames[_index].canvas.getContext("2d");
      doFrame();
      _index++;
      Editor.setProgressbar(MATH.round(_index * 100 / _framesNumber));
      requestAnimationFrame(_doWork);
    } else {
      console.log("ChromaKey effect in", new Date().getTime() - _startTime, "ms");
      _callback && _callback();
    }

  };


  var cippo = (function () {

    var coordX = 0, coordY = 0, targetColor = [];
    var abs = MATH.abs;
    var doFrame = (function () {

      var tolerance = 50;
      var pixelCompare = function (i, targetColor, fillcolor, data, length, tolerance) {
      	if (i < 0 || i >= length) return false; //out of bounds
      	if (data[i + 3] === 0 && fillcolor.a > 0) return (targetColor[3] === 0);  //surface is invisible and fill is visible

      	if (
      		abs(targetColor[3] - fillcolor.a) <= tolerance &&
      		abs(targetColor[0] - fillcolor.r) <= tolerance &&
      		abs(targetColor[1] - fillcolor.g) <= tolerance &&
      		abs(targetColor[2] - fillcolor.b) <= tolerance
      	) return false; //target is same as fill

      	if (
      		(targetColor[3] === data[i + 3]) &&
      		(targetColor[0] === data[i]) &&
      		(targetColor[1] === data[i + 1]) &&
      		(targetColor[2] === data[i + 2])
      	) return true; //target matches surface

      	if (
      		abs(targetColor[3] - data[i + 3]) <= (255 - tolerance) &&
      		abs(targetColor[0] - data[i]) <= tolerance &&
      		abs(targetColor[1] - data[i + 1]) <= tolerance &&
      		abs(targetColor[2] - data[i + 2]) <= tolerance
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

      return function () {

        var fillcolor = {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        };
        image = _context.getImageData(0, 0, _canvasWidth, _canvasHeight);
        data = image.data;
        length = data.length;
      	Q = [];
      	e = w = i = (MATH.floor(coordX) + MATH.floor(coordY) * _canvasWidth) * 4;
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
        _context.putImageData(image, 0, 0);

      };

    })();

    return function (fs, x, y, currentFrameIndex, cb) {

      _frames = fs;
      _callback = cb;
      _framesNumber = fs.length;
      coordX = x;
      coordY = y;
      _index = 0;
      _startTime = new Date().getTime();
      var currentCanvas = _frames[currentFrameIndex].canvas;
      _canvasWidth = currentCanvas.width;
      _canvasHeight = currentCanvas.height;

      var data = currentCanvas.getContext("2d").getImageData(0, 0, _canvasWidth, _canvasHeight).data;
      var px = (MATH.floor(x) + MATH.floor(y) * _canvasWidth) * 4;
      targetColor = [data[px], data[px + 1], data[px + 2], data[px + 3]];

      _doWork = _doWork.bind({}, doFrame);
      _doWork();

    };

  })();

  var chroma = (function () {

    var pow = MATH.pow;
    var dE76 = function (a, b, c, d, e, f) {
      return MATH.sqrt(pow(d - a, 2) + pow(e - b, 2) + pow(f - c, 2))
    };
    var imageData, data32, clampedArray;
    var labColor;
    var dEScore;
    var r, g, b;
    var x, y;
    var pixel;

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

      var X = _r * 0.4124 + _g * 0.3576 + _b * 0.1805;
      var Y = _r * 0.2126 + _g * 0.7152 + _b * 0.0722;
      var Z = _r * 0.0193 + _g * 0.1192 + _b * 0.9505;
      return [X, Y, Z];

      // return [
      //   _r * 0.4124 + _g * 0.3576 + _b * 0.1805,
      //   _r * 0.2126 + _g * 0.7152 + _b * 0.0722,
      //   _r * 0.0193 + _g * 0.1192 + _b * 0.9505
      // ];
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

      var CIE_L = (116 * _Y) - 16;
      var CIE_a = 500 * (_X - _Y);
      var CIE_b = 200 * (_Y - _Z);
      return [CIE_L, CIE_a, CIE_b];

      // return [
      //   (116 * _Y) - 16,
      //   500 * (_X - _Y),
      //   200 * (_Y - _Z)
      // ];
    };

    var doFrame = function () {
      // use Uint32Array for performance
      imageData = _context.getImageData(0, 0, _canvasWidth, _canvasHeight);
      data32 = new Uint32Array(imageData.data.buffer);
      clampedArray = new Uint8ClampedArray(data32.buffer)

      for (y = 0; y < _canvasHeight; ++y) {
        for (x = 0; x < _canvasWidth; ++x) {
          pixel = data32[y * _canvasWidth + x];
          r = (pixel) & 0xff;
          g = (pixel >> 8) & 0xff;
          b = (pixel >> 16) & 0xff;
          labColor = rgbToLab(r, g, b);

          // test light green
          dEScore = dE76(
            labColor[0],labColor[1],labColor[2],
            89, -99, 79
          );
          if (dEScore < 70) {
            data32[y * _canvasWidth + x] =
              (255 << 24) |
              (0 << 16) |
              (0 << 8) |
              MATH.floor(MATH.random() * (255 - 1 + 1) + 1);
            continue;
          }
          // test dark green
          dEScore = dE76(
            labColor[0], labColor[1], labColor[2],
            44, -40, 43
          );
          if (dEScore < 24) {
            data32[y * _canvasWidth + x] =
              (255 << 24) |
              (0 << 16) |
              (0 << 8) |
              MATH.floor(MATH.random() * (255 - 1 + 1) + 1);
            continue;
          }
          // test middle green
          dEScore = dE76(
            labColor[0], labColor[1], labColor[2],
            68, -43, 53
          );
          if (dEScore < 13) {
            data32[y * _canvasWidth + x] =
              (255 << 24) |
              (0 << 16) |
              (0 << 8) |
              MATH.floor(MATH.random() * (255 - 1 + 1) + 1);
            // continue;
          }
        }
      }
      imageData.data.set(clampedArray);
      _context.putImageData(imageData, 0, 0);
    };

    return function (fs, cb) {

      _frames = fs;
      _callback = cb;
      _framesNumber = fs.length;
      _index = 0;
      _startTime = new Date().getTime();

      var canvas = _frames[0].canvas;
      _canvasWidth = canvas.width;
      _canvasHeight = canvas.height;

      _doWork = _doWork.bind({}, doFrame);
      _doWork();

    };

  })();

  function init () {
    Editor = app.Editor;
  }

  app.module("Tools.Bucket", {
    init,
    cippo,
    chroma
  });

})(APP);
