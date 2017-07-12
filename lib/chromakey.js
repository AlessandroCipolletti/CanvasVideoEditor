var Chromakey = (function () {

  var MATH = Math;
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

  function rgbToLab (r, g, b) {
    var xyz = rgbToXyz(r, g, b);
    return xyzToLab(xyz[0], xyz[1], xyz[2]);
  }

  function rgbToXyz (r, g, b) {
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

    // var X = _r * 0.4124 + _g * 0.3576 + _b * 0.1805;
    // var Y = _r * 0.2126 + _g * 0.7152 + _b * 0.0722;
    // var Z = _r * 0.0193 + _g * 0.1192 + _b * 0.9505;
    // return [X, Y, Z];

    return [
      _r * 0.4124 + _g * 0.3576 + _b * 0.1805,
      _r * 0.2126 + _g * 0.7152 + _b * 0.0722,
      _r * 0.0193 + _g * 0.1192 + _b * 0.9505
    ];
  }

  function xyzToLab (x, y, z) {
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

    // var CIE_L = (116 * _Y) - 16;
    // var CIE_a = 500 * (_X - _Y);
    // var CIE_b = 200 * (_Y - _Z);
    // return [CIE_L, CIE_a, CIE_b];

    return [
      (116 * _Y) - 16,
      500 * (_X - _Y),
      200 * (_Y - _Z)
    ];
  }

  return function (ctx, width, height) {
    // use Uint32Array for performance
    imageData = canvasCtx.getImageData(0, 0, width, height);
    data32 = new Uint32Array(imageData.data.buffer);
    clampedArray = new Uint8ClampedArray(data32.buffer)

    for (y = 0; y < height; ++y) {
      for (x = 0; x < width; ++x) {
        pixel = data32[y * width + x];
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
          data32[y * canvasWidth + x] =
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
          data32[y * canvasWidth + x] =
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
          data32[y * canvasWidth + x] =
            (255 << 24) |
            (0 << 16) |
            (0 << 8) |
            MATH.floor(MATH.random() * (255 - 1 + 1) + 1);
          // continue;
        }
      }
    }
    imageData.data.set(clampedArray);
    ctx.putImageData(imageData, 0, 0);
  };

});
