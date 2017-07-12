(function (app) {
  "use strict";
  // Dependencies
  var MATH = Math;
  var Editor = {};

  var cippo = (function () {

    var framesNumber = 0, startTime = 0, canvasWidth = 0, canvasHeight = 0, index = 0, coordX = 0, coordY = 0;
    var frames = [], context = {}, targetColor = [], callback = {};

    var bucketFrame = (function () {

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

      return function () {

        var fillcolor = {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        };
        image = context.getImageData(0, 0, canvasWidth, canvasHeight);
        data = image.data;
        length = data.length;
      	Q = [];
      	e = w = i = (MATH.floor(coordX) + MATH.floor(coordY) * canvasWidth) * 4;
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
        context.putImageData(image, 0, 0);

      };

    })();

    var doWork = function () {

      if (index < framesNumber) {
        context = frames[index].canvas.getContext("2d");
        bucketFrame();
        index++;
        Editor.setProgressbar(MATH.round(index * 100 / framesNumber));
        requestAnimationFrame(doWork);
      } else {
        console.log("ChromaKey effect in", new Date().getTime() - startTime, "ms");
        callback && callback();
      }

    };

    return function (fs, x, y, currentFrameIndex, cb) {

      frames = fs;
      callback = cb;
      framesNumber = frames.length;
      coordX = x;
      coordY = y;
      index = 0;
      startTime = new Date().getTime();
      var currentCanvas = frames[currentFrameIndex].canvas;
      canvasWidth = currentCanvas.width;
      canvasHeight = currentCanvas.height;

      var data = currentCanvas.getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight).data;
      var px = (MATH.floor(x) + MATH.floor(y) * canvasWidth) * 4;
      targetColor = [data[px], data[px + 1], data[px + 2], data[px + 3]];
      doWork();
    };

  })();

  var chroma = (function (fs, callback) {

    return function () {

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
