/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/color.js":
/*!*************************!*\
  !*** ./src/js/color.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "grey": () => (/* binding */ grey),
/* harmony export */   "palette": () => (/* binding */ palette),
/* harmony export */   "rgb": () => (/* binding */ rgb)
/* harmony export */ });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "./src/js/util.js");

function rgb(r, g, b) {
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}
function grey(whiteAmt) {
  whiteAmt = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.clamp)(whiteAmt, 0, 1);
  const whiteRgb = Math.floor(255 * whiteAmt);
  return rgb(whiteRgb, whiteRgb, whiteRgb);
}
const palette = {
  black: '#333',
  blue: '#4657d7',
  cyan: '#57a7cc',
  pink: '#e91e63',
  orange: '#ed7656'
};

/***/ }),

/***/ "./src/js/conductor.js":
/*!*****************************!*\
  !*** ./src/js/conductor.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Conductor)
/* harmony export */ });
class Conductor {
  constructor(controllers) {
    this.lastTime = Date.now();
    this.mousePosition = null;
    this.controllers = controllers.slice();
    this.updatingControllers = []; // We can handle these all the same really.

    document.addEventListener('mousemove', evt => this.updateMousePosition(evt));
    document.addEventListener('mousedown', evt => this.updateMousePosition(evt));
    document.addEventListener('mouseup', evt => this.updateMousePosition(evt));
    document.addEventListener('touchmove', evt => this.updateTouchPosition(evt));
    document.addEventListener('touchstart', evt => this.updateTouchPosition(evt));
    document.addEventListener('touchend', evt => this.updateTouchPosition(evt));
    window.addEventListener('resize', evt => this.onResize(evt));
  }

  start() {
    // Kick off the update loop
    window.requestAnimationFrame(() => this.everyFrame());
  }

  onResize(evt) {
    this.controllers.forEach(controller => {
      if (typeof controller.onResize === 'function') {
        controller.onResize();
      }
    });
  }

  everyFrame() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.everyFrame());
  }

  update() {
    let curTime = Date.now();
    let dt = (curTime - this.lastTime) / 1000;
    this.updatingControllers = [];
    this.controllers.forEach(controller => {
      if (controller.isOnScreen()) {
        controller.update(dt, this.mousePosition);
        this.updatingControllers.push(controller);
      }
    });
    this.lastTime = curTime;
    const debug = document.getElementById('debug-content');

    if (debug) {
      debug.innerHTML = this.updatingControllers.map(c => c.id).join('<br>') + '<br>';
    }
  }

  render() {
    this.controllers.forEach(controller => {
      if (controller.isOnScreen()) {
        controller.render();
      }
    });
  }

  updateMousePosition(evt) {
    this.mousePosition = {
      x: evt.clientX,
      y: evt.clientY
    };
  }

  updateTouchPosition(evt) {
    if (evt.touches.length > 0) {
      this.mousePosition = {
        x: evt.touches[0].clientX,
        y: evt.touches[0].clientY
      };
    }
  }

}

/***/ }),

/***/ "./src/js/controller/canvas-controller.js":
/*!************************************************!*\
  !*** ./src/js/controller/canvas-controller.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CanvasController)
/* harmony export */ });
/* harmony import */ var _controller_util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./controller-util.js */ "./src/js/controller/controller-util.js");
/* harmony import */ var _controller_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./controller.js */ "./src/js/controller/controller.js");


class CanvasController extends _controller_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(id, width = null, height = null) {
    super();
    this.id = id;
    this.canvas = document.getElementById(id);

    if (width == null) {
      width = this.canvas.width;
    }

    if (height == null) {
      height = this.canvas.height;
    }
    /** @type {CanvasRenderingContext2D} */


    this.context = this.canvas.getContext('2d');
    this.width = width;
    this.height = height;
  }

  isOnScreen() {
    return (0,_controller_util_js__WEBPACK_IMPORTED_MODULE_0__.elementInView)(this.canvas);
  }

  getScrollPosition() {
    return (0,_controller_util_js__WEBPACK_IMPORTED_MODULE_0__.getScrollPosition)(this.canvas);
  }

  clear() {
    // Clear the previous frame
    this.context.resetTransform();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

}

/***/ }),

/***/ "./src/js/controller/controller-util.js":
/*!**********************************************!*\
  !*** ./src/js/controller/controller-util.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "elementInView": () => (/* binding */ elementInView),
/* harmony export */   "getScrollPosition": () => (/* binding */ getScrollPosition)
/* harmony export */ });
function getScrollPosition(elem) {
  const boundingRect = elem.getBoundingClientRect();
  const centerY = (boundingRect.top + boundingRect.bottom) / 2;
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  return centerY / windowHeight;
}
function elementInView(elem) {
  // Thanks stack overflow https://stackoverflow.com/a/7557433
  const boundingRect = elem.getBoundingClientRect();
  return boundingRect.bottom >= 0 && boundingRect.top <= (window.innerHeight || document.documentElement.clientHeight) && boundingRect.right >= 0 && boundingRect.left <= (window.innerWidth || document.documentElement.clientWidth);
}

/***/ }),

/***/ "./src/js/controller/controller.js":
/*!*****************************************!*\
  !*** ./src/js/controller/controller.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Controller)
/* harmony export */ });
class Controller {
  update(dt, mousePosition) {// nothing.
  }

  isOnScreen() {
    return true;
  }

  render() {// nothing.
  }

}

/***/ }),

/***/ "./src/js/controller/range-controller.js":
/*!***********************************************!*\
  !*** ./src/js/controller/range-controller.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RangeController)
/* harmony export */ });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util.js */ "./src/js/util.js");
/* harmony import */ var _controller_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./controller.js */ "./src/js/controller/controller.js");


class RangeController extends _controller_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor(id) {
    super();
    this.id = id;
    this.slider = document.getElementById(id);
    this.onValueChange = [];
    this.holdValueCount = 0;
    /**
     * How long to pause on the value the person set before continuing
     */

    this.holdValueLength = 10;
    this.heldValue = 0;
    this.resumeCount = 0;
    /**
     * Time to transition back to being controller automatically
     */

    this.resumeLength = 2;
    this.animate = true;
    this.animAmt = 0;
    this.period = 10;

    this.slider.oninput = () => this.holdValue();
  }

  update(dt, mousePosition) {
    if (!this.animate) {
      return;
    }

    if (this.holdValueCount > 0) {
      this.holdValueCount -= dt; // Just set it back to zero to be clean about it.

      if (this.holdValueCount <= 0) {
        this.holdValueCount = 0;
      } // we're going to return here so we don't mangle the value of the slider


      return;
    } else if (this.resumeCount > 0) {
      this.resumeCount -= dt;

      if (this.resumeCount <= 0) {
        this.resumeCount = 0;
      }
    } // Goes from 0 to 1 as stuff resumes.


    const resumeAmt = 1 - this.resumeCount / this.resumeLength;
    const easedResumeAmt = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.easeInOut)(resumeAmt, 3); // Multiply by the resume amt to slow it down

    this.animAmt += easedResumeAmt * dt / this.period;
    this.animAmt %= 1;
    const sinePos = 0.5 * Math.cos(2 * Math.PI * this.animAmt) + 0.5;
    this.slider.value = sinePos;
    this.onValueChange.forEach(fn => fn(this.slider.value));
  }

  holdValue() {
    this.holdValueCount = this.holdValueLength;
    this.resumeCount = this.resumeLength;
    this.heldValue = this.slider.value; // Calculate what the anim amt should be.

    this.animAmt = Math.acos(2 * this.heldValue - 1) / (2 * Math.PI);
    this.onValueChange.forEach(fn => fn(this.slider.value));
  }

}

/***/ }),

/***/ "./src/js/controller/wave-draw-controller.js":
/*!***************************************************!*\
  !*** ./src/js/controller/wave-draw-controller.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WaveDrawController)
/* harmony export */ });
/* harmony import */ var _canvas_controller_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./canvas-controller.js */ "./src/js/controller/canvas-controller.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util.js */ "./src/js/util.js");
/* harmony import */ var _color_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../color.js */ "./src/js/color.js");



class WaveDrawController extends _canvas_controller_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(id, width, height) {
    super(id, width, height); // just a list

    this.wavePoints = new Array(128).fill(this.height / 2);
    this.drawing = false;
    this.onDrawingStart = [];
    this.onDrawingEnd = [];
    this.lastMousePoint = null;
    this.canvas.addEventListener('mousedown', () => this.startDrawing());
    this.canvas.addEventListener('touchstart', () => this.startDrawing());
    document.addEventListener('mouseup', () => this.stopDrawing());
    document.addEventListener('touchend', () => this.stopDrawing()); // Prevent scrolling while we're drawing here

    this.canvas.addEventListener('touchmove', evt => evt.preventDefault(), {
      passive: false
    });
  }

  get normPath() {
    return this.wavePoints.map(el => el / this.height);
  }

  startDrawing() {
    this.drawing = true;
    this.lastMousePoint = null;
    this.onDrawingStart.forEach(fn => fn());
  }

  stopDrawing() {
    if (this.drawing) {
      this.drawing = false;
      this.lastMousePoint = null;
      this.onDrawingEnd.forEach(fn => fn());
    }
  }

  update(dt, mousePosition) {
    if (!mousePosition || !this.drawing) {
      return;
    }

    const canvasPosition = this.canvas.getBoundingClientRect(); // we have to account for the border here too

    const actualWidth = canvasPosition.right - canvasPosition.left - 2; // 500 being the 'default' width

    const scale = 500 / actualWidth;
    const mousePoint = {
      x: scale * (mousePosition.x - canvasPosition.x),
      y: scale * (mousePosition.y - canvasPosition.y)
    };

    if (this.lastMousePoint == null) {
      this.lastMousePoint = mousePoint;
    }

    const xDiff = Math.abs(mousePoint.x - this.lastMousePoint.x);
    const pointsGap = this.width / this.wavePoints.length;
    const lerpPoints = 2 * Math.ceil(xDiff / pointsGap) + 1;

    for (let i = 0; i < lerpPoints; i++) {
      const amt = (i - 1) / lerpPoints;
      const index = this.getNearestIndex((0,_util_js__WEBPACK_IMPORTED_MODULE_1__.slurp)(this.lastMousePoint.x, mousePoint.x, amt));
      this.wavePoints[index] = (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.slurp)(this.lastMousePoint.y, mousePoint.y, amt);
    }

    this.lastMousePoint = mousePoint;
  }
  /**
   * Gets the nearest index in the wave array to the x coord on the screen
   * @param {Number} x
   */


  getNearestIndex(x) {
    const xAmt = x / this.width;
    let pos = Math.round(this.wavePoints.length * xAmt) % this.wavePoints.length;

    if (pos < 0) {
      pos += this.wavePoints.length;
    }

    return pos;
  }

  render() {
    this.clear();
    this.renderWave();
  }

  renderWave() {
    this.context.beginPath();
    this.context.lineWidth = 2;
    this.context.strokeStyle = _color_js__WEBPACK_IMPORTED_MODULE_2__.palette.pink;

    for (let i = 0; i <= this.wavePoints.length; i++) {
      const index = i % this.wavePoints.length;
      const amt = i / this.wavePoints.length;
      const x = this.width * amt;
      const y = this.wavePoints[index];

      if (i == 0) {
        this.context.moveTo(x, y);
      } else {
        this.context.lineTo(x, y);
      }
    }

    this.context.stroke();
  }

}

/***/ }),

/***/ "./src/js/controller/wave-split-controller.js":
/*!****************************************************!*\
  !*** ./src/js/controller/wave-split-controller.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WaveSplitController)
/* harmony export */ });
/* harmony import */ var _canvas_controller_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./canvas-controller.js */ "./src/js/controller/canvas-controller.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util.js */ "./src/js/util.js");
/* harmony import */ var _just_fourier_things_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../just-fourier-things.js */ "./src/js/just-fourier-things.js");
/* harmony import */ var _color_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../color.js */ "./src/js/color.js");
/* harmony import */ var _wave_things_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../wave-things.js */ "./src/js/wave-things.js");





const transitionFactor = 1 / 15;
class WaveSplitController extends _canvas_controller_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(id, width, height) {
    super(id, width, height);
    this.animAmt = 0;
    this.wavePoints = [];
    this.partialWave = [];
    this.fourierPoints = [];
    this.onFourierChange = [];
    this.waveTop = 0;
    this.waveBottom = 0;
    this.totalHeight = 0;
    this.fadeFrequencies = true;
    this.splitAnim = true; // How many of the waves to draw

    this.fourierAmt = 1;
  }

  setPath(path) {
    // Update the wave points. For the sake of removing the constant term in the FFT,
    // Set the mean to be 0.
    const pathAverage = path.reduce((a, b) => a + b, 0) / path.length;
    this.wavePoints = path.map(p => p - pathAverage); // Calculate fourier points, and drop the small things.

    this.fourierData = (0,_just_fourier_things_js__WEBPACK_IMPORTED_MODULE_2__.getRealFourierData)(this.wavePoints).filter(f => f.amplitude > 0.001);
    this.fourierData.sort((a, b) => b.amplitude - a.amplitude); // Calculate the heights of the main wave and all the sine things

    this.waveTop = Math.min(...this.wavePoints);
    this.waveBottom = Math.max(...this.wavePoints); // Total height. Start with the main wave...

    this.totalHeight = this.waveBottom - this.waveTop; // Then add all the sine thingos

    this.fourierData.forEach(el => this.totalHeight += 2 * el.amplitude); // reset the animation too

    this.animAmt = 0;
    this.splitAmt = 0;
    this.onFourierChange.forEach(fn => fn());
  }

  update(dt, mousePosition) {
    const period = 7;
    this.animAmt += dt / period;
    this.animAmt %= 1;
    const pos = this.getScrollPosition();
    let desiredSplitAmt = 0;

    if (pos < 0.7) {
      desiredSplitAmt = 1;
    }

    this.splitAmt += transitionFactor * (desiredSplitAmt - this.splitAmt);
  }

  render() {
    this.clear();
    this.renderWaves();
  }

  renderWaves() {
    if (this.wavePoints.length == 0) {
      return;
    }

    this.context.strokeStyle = _color_js__WEBPACK_IMPORTED_MODULE_3__.palette.cyan;
    this.context.lineWidth = 2;
    const numBabies = Math.min(50, this.fourierData.length);
    const top = 0.1 * this.context.canvas.height;
    const bottom = 0.9 * this.context.canvas.height; // TODO: also incorporate into the frequencies to scale that too?

    const sizeMultiple = (bottom - top) / this.totalHeight;
    const spacingMultiplier = 0.8; // Running thing that says where to draw each wave.

    let curWavePos = 0;
    let startXAmt = -this.animAmt;
    let splitAmt = 1;
    let fadeAmt = 1;

    if (this.splitAnim) {
      splitAmt = this.splitAmt;
      fadeAmt = splitAmt;
    } // Actually, we're going to skip drawing the main wave here and draw it later.


    curWavePos += this.waveBottom - this.waveTop; // Draw its little babies.
    // Also sum up their values to draw the partial wave.

    this.partialWave = this.wavePoints.slice().fill(0);
    const renderedBabies = Math.round((0,_util_js__WEBPACK_IMPORTED_MODULE_1__.slurp)(1, numBabies, this.fourierAmt));

    for (let babe = 0; babe < renderedBabies; babe++) {
      let babeAmt = babe / (numBabies - 1);
      const waveData = this.fourierData[babe];
      curWavePos += waveData.amplitude;
      const wavePosition = (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.slurp)(-this.waveTop, curWavePos, splitAmt); // lets generate this wave hey
      // TODO: cache this?

      const wave = this.wavePoints.slice();

      for (let i = 0; i < this.wavePoints.length; i++) {
        const iAmt = i / this.wavePoints.length;
        const fullWaveAmt = this.wavePoints[i];
        const sineAmt = waveData.amplitude * Math.cos(2 * Math.PI * waveData.freq * iAmt + waveData.phase);
        wave[i] = (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.slurp)(fullWaveAmt, sineAmt, splitAmt); // While we're here, update the partial wave

        this.partialWave[i] += wave[i];
      }

      this.context.beginPath();
      this.context.globalAlpha = fadeAmt;

      if (this.fadeFrequencies) {
        this.context.globalAlpha *= 1 - babeAmt;
      }

      (0,_wave_things_js__WEBPACK_IMPORTED_MODULE_4__.renderWave)({
        context: this.context,
        width: this.width,
        wave: wave,
        yPosition: top + sizeMultiple * wavePosition,
        yMultiple: sizeMultiple * spacingMultiplier,
        startXAmt: startXAmt
      });
      this.context.stroke();
      this.context.globalAlpha = 1;
      curWavePos += waveData.amplitude;
    }

    curWavePos = 0;
    curWavePos -= this.waveTop;

    if (this.fourierAmt == 1) {
      // Eh just make it the full wave.
      this.partialWave = this.wavePoints;
    } // Now, lets go back and draw the main wave
    // Draw the main boy


    this.context.strokeStyle = _color_js__WEBPACK_IMPORTED_MODULE_3__.palette.blue;
    this.context.lineWidth = 2;
    this.context.beginPath();
    (0,_wave_things_js__WEBPACK_IMPORTED_MODULE_4__.renderWave)({
      context: this.context,
      width: this.width,
      wave: this.partialWave,
      yPosition: top + sizeMultiple * curWavePos,
      yMultiple: sizeMultiple * spacingMultiplier,
      startXAmt: startXAmt
    });
    this.context.stroke();
  }

}

/***/ }),

/***/ "./src/js/fft.js":
/*!***********************!*\
  !*** ./src/js/fft.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Conductor)
/* harmony export */ });
class Conductor {
  constructor(size) {
    this.size = size | 0;
    if (this.size <= 1 || (this.size & this.size - 1) !== 0) throw new Error('FFT size must be a power of two and bigger than 1');
    this._csize = size << 1; // NOTE: Use of `var` is intentional for old V8 versions

    var table = new Array(this.size * 2);

    for (var i = 0; i < table.length; i += 2) {
      const angle = Math.PI * i / this.size;
      table[i] = Math.cos(angle);
      table[i + 1] = -Math.sin(angle);
    }

    this.table = table; // Find size's power of two

    var power = 0;

    for (var t = 1; this.size > t; t <<= 1) power++; // Calculate initial step's width:
    //   * If we are full radix-4 - it is 2x smaller to give inital len=8
    //   * Otherwise it is the same as `power` to give len=4


    this._width = power % 2 === 0 ? power - 1 : power; // Pre-compute bit-reversal patterns

    this._bitrev = new Array(1 << this._width);

    for (var j = 0; j < this._bitrev.length; j++) {
      this._bitrev[j] = 0;

      for (var shift = 0; shift < this._width; shift += 2) {
        var revShift = this._width - shift - 2;
        this._bitrev[j] |= (j >>> shift & 3) << revShift;
      }
    }

    this._out = null;
    this._data = null;
    this._inv = 0;
  } // module.exports = FFT;


  fromComplexArray(complex, storage) {
    var res = storage || new Array(complex.length >>> 1);

    for (var i = 0; i < complex.length; i += 2) res[i >>> 1] = complex[i];

    return res;
  }

  createComplexArray() {
    const res = new Array(this._csize);

    for (var i = 0; i < res.length; i++) res[i] = 0;

    return res;
  }

  toComplexArray(input, storage) {
    var res = storage || this.createComplexArray();

    for (var i = 0; i < res.length; i += 2) {
      res[i] = input[i >>> 1];
      res[i + 1] = 0;
    }

    return res;
  }

  completeSpectrum(spectrum) {
    var size = this._csize;
    var half = size >>> 1;

    for (var i = 2; i < half; i += 2) {
      spectrum[size - i] = spectrum[i];
      spectrum[size - i + 1] = -spectrum[i + 1];
    }
  }

  transform(out, data) {
    if (out === data) throw new Error('Input and output buffers must be different');
    this._out = out;
    this._data = data;
    this._inv = 0;

    this._transform4();

    this._out = null;
    this._data = null;
  }

  realTransform(out, data) {
    if (out === data) throw new Error('Input and output buffers must be different');
    this._out = out;
    this._data = data;
    this._inv = 0;

    this._realTransform4();

    this._out = null;
    this._data = null;
  }

  inverseTransform(out, data) {
    if (out === data) throw new Error('Input and output buffers must be different');
    this._out = out;
    this._data = data;
    this._inv = 1;

    this._transform4();

    for (var i = 0; i < out.length; i++) out[i] /= this.size;

    this._out = null;
    this._data = null;
  }

  // radix-4 implementation
  //
  // NOTE: Uses of `var` are intentional for older V8 version that do not
  // support both `let compound assignments` and `const phi`
  _transform4() {
    var out = this._out;
    var size = this._csize; // Initial step (permute and transform)

    var width = this._width;
    var step = 1 << width;
    var len = size / step << 1;
    var outOff;
    var t;
    var bitrev = this._bitrev;

    if (len === 4) {
      for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
        const off = bitrev[t];

        this._singleTransform2(outOff, off, step);
      }
    } else {
      // len === 8
      for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
        const off = bitrev[t];

        this._singleTransform4(outOff, off, step);
      }
    } // Loop through steps in decreasing order


    var inv = this._inv ? -1 : 1;
    var table = this.table;

    for (step >>= 2; step >= 2; step >>= 2) {
      len = size / step << 1;
      var quarterLen = len >>> 2; // Loop through offsets in the data

      for (outOff = 0; outOff < size; outOff += len) {
        // Full case
        var limit = outOff + quarterLen;

        for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
          const A = i;
          const B = A + quarterLen;
          const C = B + quarterLen;
          const D = C + quarterLen; // Original values

          const Ar = out[A];
          const Ai = out[A + 1];
          const Br = out[B];
          const Bi = out[B + 1];
          const Cr = out[C];
          const Ci = out[C + 1];
          const Dr = out[D];
          const Di = out[D + 1]; // Middle values

          const MAr = Ar;
          const MAi = Ai;
          const tableBr = table[k];
          const tableBi = inv * table[k + 1];
          const MBr = Br * tableBr - Bi * tableBi;
          const MBi = Br * tableBi + Bi * tableBr;
          const tableCr = table[2 * k];
          const tableCi = inv * table[2 * k + 1];
          const MCr = Cr * tableCr - Ci * tableCi;
          const MCi = Cr * tableCi + Ci * tableCr;
          const tableDr = table[3 * k];
          const tableDi = inv * table[3 * k + 1];
          const MDr = Dr * tableDr - Di * tableDi;
          const MDi = Dr * tableDi + Di * tableDr; // Pre-Final values

          const T0r = MAr + MCr;
          const T0i = MAi + MCi;
          const T1r = MAr - MCr;
          const T1i = MAi - MCi;
          const T2r = MBr + MDr;
          const T2i = MBi + MDi;
          const T3r = inv * (MBr - MDr);
          const T3i = inv * (MBi - MDi); // Final values

          const FAr = T0r + T2r;
          const FAi = T0i + T2i;
          const FCr = T0r - T2r;
          const FCi = T0i - T2i;
          const FBr = T1r + T3i;
          const FBi = T1i - T3r;
          const FDr = T1r - T3i;
          const FDi = T1i + T3r;
          out[A] = FAr;
          out[A + 1] = FAi;
          out[B] = FBr;
          out[B + 1] = FBi;
          out[C] = FCr;
          out[C + 1] = FCi;
          out[D] = FDr;
          out[D + 1] = FDi;
        }
      }
    }
  }

  // radix-2 implementation
  //
  // NOTE: Only called for len=4
  _singleTransform2(outOff, off, step) {
    const out = this._out;
    const data = this._data;
    const evenR = data[off];
    const evenI = data[off + 1];
    const oddR = data[off + step];
    const oddI = data[off + step + 1];
    const leftR = evenR + oddR;
    const leftI = evenI + oddI;
    const rightR = evenR - oddR;
    const rightI = evenI - oddI;
    out[outOff] = leftR;
    out[outOff + 1] = leftI;
    out[outOff + 2] = rightR;
    out[outOff + 3] = rightI;
  }

  // radix-4
  //
  // NOTE: Only called for len=8
  _singleTransform4(outOff, off, step) {
    const out = this._out;
    const data = this._data;
    const inv = this._inv ? -1 : 1;
    const step2 = step * 2;
    const step3 = step * 3; // Original values

    const Ar = data[off];
    const Ai = data[off + 1];
    const Br = data[off + step];
    const Bi = data[off + step + 1];
    const Cr = data[off + step2];
    const Ci = data[off + step2 + 1];
    const Dr = data[off + step3];
    const Di = data[off + step3 + 1]; // Pre-Final values

    const T0r = Ar + Cr;
    const T0i = Ai + Ci;
    const T1r = Ar - Cr;
    const T1i = Ai - Ci;
    const T2r = Br + Dr;
    const T2i = Bi + Di;
    const T3r = inv * (Br - Dr);
    const T3i = inv * (Bi - Di); // Final values

    const FAr = T0r + T2r;
    const FAi = T0i + T2i;
    const FBr = T1r + T3i;
    const FBi = T1i - T3r;
    const FCr = T0r - T2r;
    const FCi = T0i - T2i;
    const FDr = T1r - T3i;
    const FDi = T1i + T3r;
    out[outOff] = FAr;
    out[outOff + 1] = FAi;
    out[outOff + 2] = FBr;
    out[outOff + 3] = FBi;
    out[outOff + 4] = FCr;
    out[outOff + 5] = FCi;
    out[outOff + 6] = FDr;
    out[outOff + 7] = FDi;
  }

  // Real input radix-4 implementation
  _realTransform4() {
    var out = this._out;
    var size = this._csize; // Initial step (permute and transform)

    var width = this._width;
    var step = 1 << width;
    var len = size / step << 1;
    var outOff;
    var t;
    var bitrev = this._bitrev;

    if (len === 4) {
      for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
        const off = bitrev[t];

        this._singleRealTransform2(outOff, off >>> 1, step >>> 1);
      }
    } else {
      // len === 8
      for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
        const off = bitrev[t];

        this._singleRealTransform4(outOff, off >>> 1, step >>> 1);
      }
    } // Loop through steps in decreasing order


    var inv = this._inv ? -1 : 1;
    var table = this.table;

    for (step >>= 2; step >= 2; step >>= 2) {
      len = size / step << 1;
      var halfLen = len >>> 1;
      var quarterLen = halfLen >>> 1;
      var hquarterLen = quarterLen >>> 1; // Loop through offsets in the data

      for (outOff = 0; outOff < size; outOff += len) {
        for (var i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
          var A = outOff + i;
          var B = A + quarterLen;
          var C = B + quarterLen;
          var D = C + quarterLen; // Original values

          var Ar = out[A];
          var Ai = out[A + 1];
          var Br = out[B];
          var Bi = out[B + 1];
          var Cr = out[C];
          var Ci = out[C + 1];
          var Dr = out[D];
          var Di = out[D + 1]; // Middle values

          var MAr = Ar;
          var MAi = Ai;
          var tableBr = table[k];
          var tableBi = inv * table[k + 1];
          var MBr = Br * tableBr - Bi * tableBi;
          var MBi = Br * tableBi + Bi * tableBr;
          var tableCr = table[2 * k];
          var tableCi = inv * table[2 * k + 1];
          var MCr = Cr * tableCr - Ci * tableCi;
          var MCi = Cr * tableCi + Ci * tableCr;
          var tableDr = table[3 * k];
          var tableDi = inv * table[3 * k + 1];
          var MDr = Dr * tableDr - Di * tableDi;
          var MDi = Dr * tableDi + Di * tableDr; // Pre-Final values

          var T0r = MAr + MCr;
          var T0i = MAi + MCi;
          var T1r = MAr - MCr;
          var T1i = MAi - MCi;
          var T2r = MBr + MDr;
          var T2i = MBi + MDi;
          var T3r = inv * (MBr - MDr);
          var T3i = inv * (MBi - MDi); // Final values

          var FAr = T0r + T2r;
          var FAi = T0i + T2i;
          var FBr = T1r + T3i;
          var FBi = T1i - T3r;
          out[A] = FAr;
          out[A + 1] = FAi;
          out[B] = FBr;
          out[B + 1] = FBi; // Output final middle point

          if (i === 0) {
            var FCr = T0r - T2r;
            var FCi = T0i - T2i;
            out[C] = FCr;
            out[C + 1] = FCi;
            continue;
          } // Do not overwrite ourselves


          if (i === hquarterLen) continue; // In the flipped case:
          // MAi = -MAi
          // MBr=-MBi, MBi=-MBr
          // MCr=-MCr
          // MDr=MDi, MDi=MDr

          var ST0r = T1r;
          var ST0i = -T1i;
          var ST1r = T0r;
          var ST1i = -T0i;
          var ST2r = -inv * T3i;
          var ST2i = -inv * T3r;
          var ST3r = -inv * T2i;
          var ST3i = -inv * T2r;
          var SFAr = ST0r + ST2r;
          var SFAi = ST0i + ST2i;
          var SFBr = ST1r + ST3i;
          var SFBi = ST1i - ST3r;
          var SA = outOff + quarterLen - i;
          var SB = outOff + halfLen - i;
          out[SA] = SFAr;
          out[SA + 1] = SFAi;
          out[SB] = SFBr;
          out[SB + 1] = SFBi;
        }
      }
    }
  }

  // radix-2 implementation
  //
  // NOTE: Only called for len=4
  _singleRealTransform2(outOff, off, step) {
    const out = this._out;
    const data = this._data;
    const evenR = data[off];
    const oddR = data[off + step];
    const leftR = evenR + oddR;
    const rightR = evenR - oddR;
    out[outOff] = leftR;
    out[outOff + 1] = 0;
    out[outOff + 2] = rightR;
    out[outOff + 3] = 0;
  }

  // radix-4
  //
  // NOTE: Only called for len=8
  _singleRealTransform4(outOff, off, step) {
    const out = this._out;
    const data = this._data;
    const inv = this._inv ? -1 : 1;
    const step2 = step * 2;
    const step3 = step * 3; // Original values

    const Ar = data[off];
    const Br = data[off + step];
    const Cr = data[off + step2];
    const Dr = data[off + step3]; // Pre-Final values

    const T0r = Ar + Cr;
    const T1r = Ar - Cr;
    const T2r = Br + Dr;
    const T3r = inv * (Br - Dr); // Final values

    const FAr = T0r + T2r;
    const FBr = T1r;
    const FBi = -T3r;
    const FCr = T0r - T2r;
    const FDr = T1r;
    const FDi = T3r;
    out[outOff] = FAr;
    out[outOff + 1] = 0;
    out[outOff + 2] = FBr;
    out[outOff + 3] = FBi;
    out[outOff + 4] = FCr;
    out[outOff + 5] = 0;
    out[outOff + 6] = FDr;
    out[outOff + 7] = FDi;
  }

}

/***/ }),

/***/ "./src/js/just-fourier-things.js":
/*!***************************************!*\
  !*** ./src/js/just-fourier-things.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getFourierData": () => (/* binding */ getFourierData),
/* harmony export */   "getFourierRI": () => (/* binding */ getFourierRI),
/* harmony export */   "getRealFourierData": () => (/* binding */ getRealFourierData),
/* harmony export */   "resample2dData": () => (/* binding */ resample2dData)
/* harmony export */ });
/* harmony import */ var _fft_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fft.js */ "./src/js/fft.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util.js */ "./src/js/util.js");


/**
 * Do the fourier thing using a bunch of complex points
 *
 * @param {Array<Number>} points Array of points, alternative with re, im pairs. Length must be a power of 2
 */

function getFourierData(points) {
  if (points.length == 0) {
    return [];
  }

  const numPoints = points.length / 2;
  const fft = new _fft_js__WEBPACK_IMPORTED_MODULE_0__["default"](numPoints);
  const out = fft.createComplexArray();
  fft.transform(out, points); // Transform into an API of points I find friendlier.

  const fftData = [];

  for (let i = 0; i < numPoints; i++) {
    // to reorder the frequencies a little nicer, we pick from the front and back altermatively
    const j = i % 2 == 0 ? i / 2 : numPoints - (i + 1) / 2;
    const x = out[2 * j];
    const y = out[2 * j + 1];
    const freq = (j + numPoints / 2) % numPoints - numPoints / 2;
    fftData.push({
      freq: freq,
      // a little expensive
      amplitude: Math.sqrt(x * x + y * y) / numPoints,
      // a lottle expensive :(
      phase: Math.atan2(y, x)
    });
  } // fftData.sort((a, b) => b.amplitude - a.amplitude);


  return fftData;
}
/**
 *
 * @param {Array<Number>} points Array of values of some wave. Must be a power of 2.
 */

function getRealFourierData(points) {
  if (points.length == 0) {
    return [];
  }

  const numPoints = points.length;
  const fft = new _fft_js__WEBPACK_IMPORTED_MODULE_0__["default"](numPoints);
  const formatedPoints = fft.createComplexArray();
  fft.toComplexArray(points, formatedPoints);
  const out = fft.createComplexArray();
  fft.transform(out, formatedPoints); // Transform into an API of points I find friendlier.

  const fftData = []; // We only have to read the first half of this because of symmetry things.

  for (let i = 0; i < numPoints / 2; i++) {
    const x = out[2 * i];
    const y = out[2 * i + 1];
    const freq = i;
    fftData.push({
      freq: freq,
      // a little expensive
      // Also we gotta multiply this by 2 to account for the other side that
      amplitude: 2 * Math.sqrt(x * x + y * y) / numPoints,
      // a lottle expensive :(
      phase: Math.atan2(y, x)
    });
  } // fftData.sort((a, b) => b.amplitude - a.amplitude);


  return fftData;
}
/**
 * Transforms a list of x, y points into input appropriate for a fourier transform.
 */

function resample2dData(points, numSamples) {
  if (points.length == 0) {
    // Can't resample if we don't have ANY points
    return [];
  }

  let newPoints = [];

  for (let i = 0; i < numSamples; i++) {
    let position = points.length * (i / numSamples);
    let index = Math.floor(position);
    let nextIndex = (index + 1) % points.length;
    let amt = position - index;
    newPoints.push(
    /* x */
    (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.slurp)(points[index].x, points[nextIndex].x, amt),
    /* y */
    (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.slurp)(points[index].y, points[nextIndex].y, amt));
  }

  return newPoints;
}
/**
 * Do the fourier thing using a bunch of complex points
 *
 * @param {Array<Number>} points Array of points, alternative with re, im pairs. Length must be a power of 2
 */

function getFourierRI(points) {
  if (points.length == 0) {
    return [];
  }

  const numPoints = points.length / 2;
  const fft = new _fft_js__WEBPACK_IMPORTED_MODULE_0__["default"](numPoints);
  const out = fft.createComplexArray();
  fft.toComplexArray(points, out);
  console.log(out); // Transform into an API of points I find friendlier.
  // const fftData = [];
  // for (let i = 0; i < numPoints; i ++) {
  //     // to reorder the frequencies a little nicer, we pick from the front and back altermatively
  //     const j = i % 2 == 0 ? i / 2 : numPoints - ((i+1) / 2);
  //     const x = out[2 * j];
  //     const y = out[2 * j + 1];
  //     const freq = ((j + numPoints / 2) % numPoints) - numPoints / 2;
  //     fftData.push({
  //         freq: freq,
  //         // a little expensive
  //         amplitude: Math.sqrt(x * x + y * y) / numPoints,
  //         // a lottle expensive :(
  //         phase: Math.atan2(y, x),
  //     });
  // }
  // // fftData.sort((a, b) => b.amplitude - a.amplitude);

  return out;
}

/***/ }),

/***/ "./src/js/midi.js":
/*!************************!*\
  !*** ./src/js/midi.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "attackCC": () => (/* binding */ attackCC),
/* harmony export */   "connectMidi": () => (/* binding */ connectMidi),
/* harmony export */   "cutoffCC": () => (/* binding */ cutoffCC),
/* harmony export */   "decayCC": () => (/* binding */ decayCC),
/* harmony export */   "delayTimeCC": () => (/* binding */ delayTimeCC),
/* harmony export */   "delayWetCC": () => (/* binding */ delayWetCC),
/* harmony export */   "driveCC": () => (/* binding */ driveCC),
/* harmony export */   "masterVolCC": () => (/* binding */ masterVolCC),
/* harmony export */   "nPiontsCC": () => (/* binding */ nPiontsCC),
/* harmony export */   "resonanceCC": () => (/* binding */ resonanceCC)
/* harmony export */ });
/* harmony import */ var _synth_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./synth.js */ "./src/js/synth.js");

let nPiontsCC = [];
let cutoffCC = [];
let resonanceCC = [];
let delayTimeCC = [];
let delayWetCC = [];
let attackCC = [];
let decayCC = [];
let driveCC = [];
let masterVolCC = [];
function connectMidi() {
  navigator.requestMIDIAccess().then(midi => midiReady(midi), err => console.log('Something went wrong', err));
}

function midiReady(midi) {
  // Also react to device changes.
  midi.addEventListener('statechange', event => initDevices(event.target));
  initDevices(midi); // see the next section!
}

function initDevices(midi) {
  // Reset.
  let midiIn = [];
  let midiOut = []; // MIDI devices that send you data.

  const inputs = midi.inputs.values();

  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    midiIn.push(input.value);
  } // MIDI devices that you send data to.


  const outputs = midi.outputs.values();

  for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
    midiOut.push(output.value);
  }

  for (const input of midiIn) {
    input.addEventListener('midimessage', midiMessageReceived);
  }
}

function midiMessageReceived(event) {
  // MIDI commands we care about. See
  // http://webaudio.github.io/web-midi-api/#a-simple-monophonic-sine-wave-midi-synthesizer.
  const NOTE_ON = 9;
  const NOTE_OFF = 8;
  const PITCH_BEND = 0xE;
  const AFTER_TOUCH = 0xD;
  const CONTROL_CHANGE = 0xB;
  const velocity = event.data.length > 2 ? event.data[2] : 1;
  const cmd = event.data[0] >> 4;
  const channel = event.data[0] & 0x0F;
  const value = event.data[1]; // Note that not all MIDI controllers send a separate NOTE_OFF command for every NOTE_ON.

  if (cmd === NOTE_OFF || cmd === NOTE_ON && velocity === 0) {
    console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, note off: pitch:${value}`);
    (0,_synth_js__WEBPACK_IMPORTED_MODULE_0__.stopSoundWave)(channel);
  } else if (cmd === NOTE_ON) {
    console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, note on: pitch:${value}, velocity: ${velocity}`);
    (0,_synth_js__WEBPACK_IMPORTED_MODULE_0__.playSoundWave)(channel, note2Frequency(value));
  } else if (cmd === PITCH_BEND) {
    const bend = ((event.data[2] << 7) + event.data[1] - 8192) / 8192; // console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, pitch shift ${(bend * 12).toFixed(1)} semitones`);

    (0,_synth_js__WEBPACK_IMPORTED_MODULE_0__.pitchShift)(channel, bend);
  } else if (cmd === AFTER_TOUCH) {
    // console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, volume:${value}`);
    (0,_synth_js__WEBPACK_IMPORTED_MODULE_0__.volumeShift)(channel, value);
  } else if (cmd === CONTROL_CHANGE) {
    switch (value) {
      case 2:
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, nFFT:${velocity}`);
        nPiontsCC.forEach(fn => fn(velocity / 127));
        break;

      case 3:
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, Filter CutOff:${velocity}`);
        let freq = Math.round(Math.pow(10, velocity / 127 * 3) * 24);
        cutoffCC.forEach(fn => fn(freq));
        break;

      case 4:
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, Filter Resonance:${velocity}`);
        resonanceCC.forEach(fn => fn(velocity * 20 / 127 + 1));
        break;

      case 5:
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, Delay Time:${velocity}`);
        delayTimeCC.forEach(fn => fn(velocity / 127));
        break;

      case 6:
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, Delay Wet:${velocity}`);
        delayWetCC.forEach(fn => fn(velocity / 127));
        break;

      case 7:
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, Attack Time:${velocity}`);
        attackCC.forEach(fn => fn(velocity * 2 / 127));
        break;

      case 8:
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, Decay Time:${velocity}`);
        decayCC.forEach(fn => fn(velocity * 2 / 127));
        break;

      case 9:
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, Drive:${velocity}`);
        driveCC.forEach(fn => fn(velocity * 500 / 127));
        break;

      case 10:
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, Master Volume:${velocity}`);
        masterVolCC.forEach(fn => fn(velocity / 127));
        break;

      case 11:
        console.log(`CC + 1`);
        break;

      case 12:
        console.log(`CC - 1`);
        break;

      default:
        break;
    }
  }
}

function note2Frequency(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

/***/ }),

/***/ "./src/js/synth.js":
/*!*************************!*\
  !*** ./src/js/synth.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "attackTimeSet": () => (/* binding */ attackTimeSet),
/* harmony export */   "decayTimeSet": () => (/* binding */ decayTimeSet),
/* harmony export */   "delayTime": () => (/* binding */ delayTime),
/* harmony export */   "delayWet": () => (/* binding */ delayWet),
/* harmony export */   "drive": () => (/* binding */ drive),
/* harmony export */   "filterCutoff": () => (/* binding */ filterCutoff),
/* harmony export */   "filterResonance": () => (/* binding */ filterResonance),
/* harmony export */   "initAudioContext": () => (/* binding */ initAudioContext),
/* harmony export */   "masterVolume": () => (/* binding */ masterVolume),
/* harmony export */   "pitchShift": () => (/* binding */ pitchShift),
/* harmony export */   "playSoundWave": () => (/* binding */ playSoundWave),
/* harmony export */   "stopSoundWave": () => (/* binding */ stopSoundWave),
/* harmony export */   "updateBuffer": () => (/* binding */ updateBuffer),
/* harmony export */   "volumeShift": () => (/* binding */ volumeShift)
/* harmony export */ });
/* harmony import */ var _wave_things_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./wave-things.js */ "./src/js/wave-things.js");
/* harmony import */ var _fft_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fft.js */ "./src/js/fft.js");


let audioContext = null;
let osc = [];
let gain = [];
let wave2 = null;
let Filter = null;
let Delay = null;
let DelayGain = null;
let DelayFeedback = null;
let Distortion = null;
let MasterVol = null;
let DistortionOn = false;
let attackTime = 0.1;
let decayTime = 0.5;
function initAudioContext() {
  if (audioContext === null) {
    audioContext = new AudioContext();
  }

  Filter = audioContext.createBiquadFilter();
  Filter.type = "lowpass";
  filterCutoff(12000);
  filterResonance(1);
  Delay = audioContext.createDelay(5.0);
  DelayFeedback = audioContext.createGain();
  DelayGain = audioContext.createGain();
  delayTime(0.3);
  delayFeedback(0.5);
  delayWet(0.5);
  Distortion = audioContext.createWaveShaper();
  drive(0);
  MasterVol = audioContext.createGain();
  masterVolume(0.5);
  Distortion.connect(Filter);
  Filter.connect(Delay);
  Delay.connect(DelayGain);
  DelayGain.connect(DelayFeedback);
  DelayFeedback.connect(Delay);
  DelayGain.connect(MasterVol);
  Filter.connect(MasterVol);
  MasterVol.connect(audioContext.destination);
}
function updateBuffer(wave) {
  if (wave.length > 0) {
    const numPoints = wave.length;
    const fft = new _fft_js__WEBPACK_IMPORTED_MODULE_1__["default"](numPoints);
    const formatedPoints = fft.createComplexArray();
    fft.toComplexArray(wave, formatedPoints);
    const out = fft.createComplexArray();
    fft.transform(out, formatedPoints);
    const l = out.length / 2;
    const real = new Float32Array(l);
    const imag = new Float32Array(l);

    for (let i = 0; i < l; i++) {
      real[i] = out[i * 2];
      imag[i] = out[i * 2 + 1];
    }

    wave2 = audioContext.createPeriodicWave(real, imag);

    for (let i = 0; i < 16; i++) {
      if (osc[i] != null) {
        osc[i].setPeriodicWave(wave2);
      }
    }

    console.log("update");
  }
}
function playSoundWave(ch, pitch) {
  osc[ch] = audioContext.createOscillator();
  gain[ch] = audioContext.createGain();
  osc[ch].setPeriodicWave(wave2);
  osc[ch].frequency.setValueAtTime(pitch, audioContext.currentTime);
  gain[ch].gain.setValueAtTime(0, audioContext.currentTime);
  gain[ch].gain.linearRampToValueAtTime(0.5, audioContext.currentTime + attackTime);
  gain[ch].gain.setTargetAtTime(0.5, audioContext.currentTime + attackTime, decayTime);
  osc[ch].connect(gain[ch]);

  if (DistortionOn) {
    gain[ch].connect(Distortion);
  } else {
    gain[ch].connect(Filter);
  }

  osc[ch].start();
}
function stopSoundWave(ch) {
  if (osc[ch] != null) {
    gain[ch].gain.cancelScheduledValues(audioContext.currentTime);
    gain[ch].gain.setValueAtTime(gain[ch].gain.value, audioContext.currentTime);
    gain[ch].gain.linearRampToValueAtTime(0, audioContext.currentTime + decayTime);
    osc[ch].stop(audioContext.currentTime + decayTime);
    osc[ch] = null;
  }
}
function attackTimeSet(value) {
  value = Math.round(value * 100) / 100;
  attackTime = value;
}
function decayTimeSet(value) {
  value = Math.round(value * 100) / 100;
  decayTime = value;
}
function pitchShift(ch, pitch) {
  if (osc[ch] != null) {
    osc[ch].detune.setValueAtTime(pitch * 1200 * 2, audioContext.currentTime);
  }
}
function volumeShift(ch, vol) {
  if (osc[ch] != null) {
    // gain[ch].gain.setValueAtTime(vol / 127, audioContext.currentTime);
    gain[ch].gain.linearRampToValueAtTime(vol / 127, audioContext.currentTime + attackTime);
  }
}
function delayTime(time) {
  Delay.delayTime.setValueAtTime(time, audioContext.currentTime);
}

function delayFeedback(value) {
  DelayFeedback.gain.setValueAtTime(value, audioContext.currentTime);
}

function delayWet(value) {
  DelayGain.gain.setValueAtTime(value, audioContext.currentTime);
}
function filterCutoff(value) {
  Filter.frequency.value = value;
}
function filterResonance(value) {
  Filter.Q.value = value;
}
function masterVolume(value) {
  MasterVol.gain.setValueAtTime(value, audioContext.currentTime);
} // async function createReverb() {
//     let convolver = audioContext.createConvolver();
//     // load impulse response from file
//     let response = await fetch("js/irRoom.wav");
//     let arraybuffer = await response.arrayBuffer();
//     convolver.buffer = await audioContext.decodeAudioData(arraybuffer);
//     return convolver;
// }

function drive(amount) {
  amount = Math.round(amount);

  if (amount < 1) {
    DistortionOn = false;
  } else {
    Distortion.curve = makeDistortionCurve(amount);
    DistortionOn = true;
  }
}

function makeDistortionCurve(amount) {
  const k = typeof amount === "number" ? amount : 50;
  const n_samples = 256;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < n_samples; i++) {
    const x = i * 2 / n_samples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }

  return curve;
}

/***/ }),

/***/ "./src/js/util.js":
/*!************************!*\
  !*** ./src/js/util.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clamp": () => (/* binding */ clamp),
/* harmony export */   "clampedSlurp": () => (/* binding */ clampedSlurp),
/* harmony export */   "divideInterval": () => (/* binding */ divideInterval),
/* harmony export */   "easeInOut": () => (/* binding */ easeInOut),
/* harmony export */   "experp": () => (/* binding */ experp),
/* harmony export */   "posMod": () => (/* binding */ posMod),
/* harmony export */   "sinEaseInOut": () => (/* binding */ sinEaseInOut),
/* harmony export */   "slurp": () => (/* binding */ slurp),
/* harmony export */   "smallEaseInOut": () => (/* binding */ smallEaseInOut),
/* harmony export */   "to2dIsometric": () => (/* binding */ to2dIsometric)
/* harmony export */ });
function easeInOut(t, amt = 2) {
  let tPow = Math.pow(t, amt);
  return tPow / (tPow + Math.pow(1 - t, amt));
}
function sinEaseInOut(t) {
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}
function smallEaseInOut(t, a, b) {
  // maximum slope, during the constant part
  let m = 1 / (1 - a - b); // f0

  if (t < a) {
    return 0;
  } // f1


  if (t < b) {
    return m / 2 / (b - a) * (t - a) * (t - a);
  } // f2


  if (t < 1 - b) {
    return m * (t - b) + // constant line part
    m / 2 * (b - a); // maximum value of f1
  } // use symmetry powers


  return 1 - smallEaseInOut(1 - t, a, b);
}
function slurp(val1, val2, amt) {
  return (val2 - val1) * amt + val1;
}
function experp(val1, val2, amt) {
  return Math.exp(slurp(Math.log(val1), Math.log(val2), amt));
}
function clampedSlurp(val1, val2, amt) {
  if (amt < 0) {
    return val1;
  }

  if (amt > 1) {
    return val2;
  }

  return slurp(val1, val2, amt);
}
function clamp(amt, val1, val2) {
  if (amt < val1) {
    return val1;
  }

  if (amt > val2) {
    return val2;
  }

  return amt;
}
/**
 * Extracts a 0-1 interval from a section of a 0-1 interval
 *
 * For example, if min == 0.3 and max == 0.7, you get:
 *
 *           0.3  0.7
 *     t: 0 --+----+-- 1
 *           /      \
 *          /        \
 *         /          \
 *     -> 0 ---------- 1
 *
 * Useful for making sub animations.
 *
 * Doesn't do any clamping, so you might want to clamp yourself.
 */

function divideInterval(t, min, max) {
  return (t - min) / (max - min);
}
/**
 * Does a positive modulo
 * @param {number} a The thing being modulo'd
 * @param {number} b The divider thing
 * @returns {number} a % b
 */

function posMod(a, b) {
  let out = a % b;

  if (out < 0) {
    out += b;
  }

  return out;
} // TODO? Redesign so this generates a function?

function to2dIsometric(x, y, z, xzAngle = 0, yAngle = 0) {
  const mul = matrixMultiplication()(3); // s/o to wikipedia for these rotation matrices

  const xzRotateMatrix = [Math.cos(xzAngle), 0, -Math.sin(xzAngle), 0, 1, 0, Math.sin(xzAngle), 0, Math.cos(xzAngle)];
  const yRotateMatrix = [1, 0, 0, 0, Math.cos(yAngle), Math.sin(yAngle), 0, -Math.sin(yAngle), Math.cos(yAngle)];
  const transformMatrix = mul(yRotateMatrix, xzRotateMatrix);
  const transformed = mul(transformMatrix, [x, y, z]); // Just return the x and y

  return {
    x: transformed[0],
    y: transformed[1]
  };
}

/***/ }),

/***/ "./src/js/wave-things.js":
/*!*******************************!*\
  !*** ./src/js/wave-things.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getWave": () => (/* binding */ getWave),
/* harmony export */   "getWaveFunction": () => (/* binding */ getWaveFunction),
/* harmony export */   "normaliseWave": () => (/* binding */ normaliseWave),
/* harmony export */   "renderWave": () => (/* binding */ renderWave),
/* harmony export */   "squareWave": () => (/* binding */ squareWave)
/* harmony export */ });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "./src/js/util.js");
 // Generates a wave from a function in the range [0, 1)

function getWave(fn, numSamples = 128) {
  let points = [];

  for (let i = 0; i < numSamples; i++) {
    const amt = i / numSamples;
    points.push(fn(amt));
  }

  return points;
}
/**
 * @param {Array<number>} wave
 * @returns {Array<number>} Normalised wave (in the range -1 to 1)
 */

function normaliseWave(wave) {
  const min = Math.min(...wave);
  const max = Math.max(...wave);
  return wave.map(sample => (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.slurp)(-1, 1, (sample - min) / (max - min)));
}
/**
 * Creates a function that gives the value of a wave at a certain point. Does some interpolation.
 * @param {Array<number>} wave
 * @returns {function(number):number} A wave function (mainly to be used by the playSoundWave thing)
 */

function getWaveFunction(wave) {
  return t => {
    t %= 1;

    if (t < 0) {
      t++;
    }

    const index = Math.floor(wave.length * t);
    const nextIndex = (index + 1) % wave.length; // The remainder from doing the divide

    const extra = wave.length * t % 1;
    return (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.slurp)(wave[index], wave[nextIndex], extra);
  };
}
function squareWave(t) {
  // Do ya own normalising ya dangus
  return t < 0.5 ? -1 : 1;
}
function renderWave({
  context,
  wave,
  width,
  yPosition = 0,
  yMultiple,
  startXAmt = 0,
  type = 'wave'
}) {
  let startI = 0; // (I think the wavelength of the wave can be configured by changing the 1 here)

  const step = 1 / wave.length; // TODO: Skip drawing the start things that are already defined.

  for (let xAmt = startXAmt, i = startI; xAmt <= 1 + step; xAmt += step, i++) {
    const index = i % wave.length;
    const x = width * xAmt;
    const y = yPosition + yMultiple * wave[index];

    if (type == 'wave') {
      if (i == 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    } else if (type == 'samples') {
      context.beginPath();
      context.arc(x, y, 2, 0, 2 * Math.PI);
      context.fill();
    }
  }
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _conductor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./conductor.js */ "./src/js/conductor.js");
/* harmony import */ var _controller_wave_split_controller_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./controller/wave-split-controller.js */ "./src/js/controller/wave-split-controller.js");
/* harmony import */ var _controller_wave_draw_controller_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./controller/wave-draw-controller.js */ "./src/js/controller/wave-draw-controller.js");
/* harmony import */ var _controller_range_controller_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./controller/range-controller.js */ "./src/js/controller/range-controller.js");
/* harmony import */ var _synth_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./synth.js */ "./src/js/synth.js");
/* harmony import */ var _midi_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./midi.js */ "./src/js/midi.js");
// import DrawController from './controller/draw-controller.js';
// import EpicyclesController from './controller/epicycles-controller.js';
// import ComplexSinusoidController from './controller/complex-sinusoid-controller.js';
// import { titlePoints } from './points/title-points.js';
// import WaveController from './controller/wave-controller.js';
// import SkewedSinusoidController from './controller/skewed-sinusoid-controller.js';
// import { peaceHandPoints } from './points/peace-hand-points.js';
// import SkewedPathController from './controller/skewed-path-controller.js';
// import { mePoints } from './points/me-points.js';
// import ImageSwapController from './controller/image-swap-controller.js';
// import { loopLikeAJpeg } from './jpeg.js';
// import ImageBuildUpController from './controller/image-build-up-controller.js';
// // import JpegCompressorController from './controller/jpeg-compressor-controller.js';
// import HeadingController from './controller/heading-controller.js';
// import WaveFrequenciesController from './controller/wave-frequencies-controller.js';
// import SelfDrawController from './controller/self-draw/self-draw-controller.js';
// import ImageMultController from './controller/image-mult-controller.js';
// import { getScrollPosition } from './controller/controller-util.js';
// import WaveSamplesController from './controller/wave-samples-controller.js';
// import { getWave, squareWave } from './wave-things.js';






let conductor = null;

function init() {
  let controllers = [];
  let waveDrawController, waveDrawSliderController, waveDrawButton, waveDrawSplitController;

  if (hasElement('wave-draw')) {
    waveDrawController = new _controller_wave_draw_controller_js__WEBPACK_IMPORTED_MODULE_2__["default"]('wave-draw');
    controllers.push(waveDrawController);
  }

  if (hasElement('wave-draw-instruction')) {
    const instruction = document.getElementById('wave-draw-instruction');

    if (waveDrawController) {
      waveDrawController.onDrawingStart.push(() => instruction.classList.add('hidden'));
    }
  }

  if (hasElement('wave-draw-slider')) {
    waveDrawSliderController = new _controller_range_controller_js__WEBPACK_IMPORTED_MODULE_3__["default"]('wave-draw-slider');
    waveDrawSliderController.animate = false;
    controllers.push(waveDrawSliderController);
  }

  if (hasElement('wave-draw-split')) {
    waveDrawSplitController = new _controller_wave_split_controller_js__WEBPACK_IMPORTED_MODULE_1__["default"]('wave-draw-split');

    if (waveDrawController != null) {
      waveDrawController.onDrawingStart.push(() => {
        waveDrawSplitController.splitAnim = true;
        waveDrawSplitController.setPath([]);
        (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.updateBuffer)(waveDrawSplitController.partialWave);
      });
      waveDrawController.onDrawingEnd.push(() => {
        waveDrawSplitController.splitAnim = true;
        waveDrawSplitController.setPath(waveDrawController.normPath);
        (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.updateBuffer)(waveDrawSplitController.partialWave);
      }); // Reset the slider back to 1 when the wave changes to draw the full wave.

      if (waveDrawSliderController) {
        waveDrawController.onDrawingStart.push(() => {
          waveDrawSliderController.slider.value = 1;
          waveDrawSplitController.fourierAmt = 1;
        });
        waveDrawController.onDrawingEnd.push(() => {
          waveDrawSliderController.slider.value = 1;
          waveDrawSplitController.fourierAmt = 1;
        });
      }
    }

    if (waveDrawSliderController != null) {
      _midi_js__WEBPACK_IMPORTED_MODULE_5__.nPiontsCC.push(val => {
        waveDrawSplitController.fourierAmt = val;
        waveDrawSplitController.splitAnim = false;
        waveDrawSliderController.slider.value = val;
        (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.updateBuffer)(waveDrawSplitController.partialWave);
      });
      waveDrawSliderController.onValueChange.push(val => {
        waveDrawSplitController.fourierAmt = val;
        waveDrawSplitController.splitAnim = false;
        (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.updateBuffer)(waveDrawSplitController.partialWave);
      });
    }

    controllers.push(waveDrawSplitController);
  }

  if (hasElement('wave-draw-button')) {
    const button = document.getElementById('wave-draw-button');

    if (button) {
      button.addEventListener('mousedown', () => (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.playSoundWave)(0, 260));
      button.addEventListener('mouseout', () => (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.stopSoundWave)(0));
      button.addEventListener('mouseup', () => (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.stopSoundWave)(0));
    }
  }

  if (hasElement('cutoff-slider')) {
    let cutoffSliderController = new _controller_range_controller_js__WEBPACK_IMPORTED_MODULE_3__["default"]('cutoff-slider');
    cutoffSliderController.animate = false;
    cutoffSliderController.onValueChange.push(val => {
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.filterCutoff)(val);
    });
    _midi_js__WEBPACK_IMPORTED_MODULE_5__.cutoffCC.push(val => {
      cutoffSliderController.slider.value = val;
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.filterCutoff)(val);
    });
    controllers.push(cutoffSliderController);
  }

  if (hasElement('resonance-slider')) {
    let resonanceSliderController = new _controller_range_controller_js__WEBPACK_IMPORTED_MODULE_3__["default"]('resonance-slider');
    resonanceSliderController.animate = false;
    resonanceSliderController.onValueChange.push(val => {
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.filterResonance)(val);
    });
    _midi_js__WEBPACK_IMPORTED_MODULE_5__.resonanceCC.push(val => {
      resonanceSliderController.slider.value = val;
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.filterResonance)(val);
    });
    controllers.push(resonanceSliderController);
  }

  if (hasElement('delay-time-slider')) {
    let delayTimeSliderController = new _controller_range_controller_js__WEBPACK_IMPORTED_MODULE_3__["default"]('delay-time-slider');
    delayTimeSliderController.animate = false;
    delayTimeSliderController.onValueChange.push(val => {
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.delayTime)(val);
    });
    _midi_js__WEBPACK_IMPORTED_MODULE_5__.delayTimeCC.push(val => {
      delayTimeSliderController.slider.value = val;
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.delayTime)(val);
    });
    controllers.push(delayTimeSliderController);
  }

  if (hasElement('delay-wet-slider')) {
    let delayWetSliderController = new _controller_range_controller_js__WEBPACK_IMPORTED_MODULE_3__["default"]('delay-wet-slider');
    delayWetSliderController.animate = false;
    delayWetSliderController.onValueChange.push(val => {
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.delayWet)(val);
    });
    _midi_js__WEBPACK_IMPORTED_MODULE_5__.delayWetCC.push(val => {
      delayWetSliderController.slider.value = val;
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.delayWet)(val);
    });
    controllers.push(delayWetSliderController);
  }

  if (hasElement('attack-slider')) {
    let attackSliderController = new _controller_range_controller_js__WEBPACK_IMPORTED_MODULE_3__["default"]('attack-slider');
    attackSliderController.animate = false;
    attackSliderController.onValueChange.push(val => {
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.attackTimeSet)(val);
    });
    _midi_js__WEBPACK_IMPORTED_MODULE_5__.attackCC.push(val => {
      attackSliderController.slider.value = val;
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.attackTimeSet)(val);
    });
    controllers.push(attackSliderController);
  }

  if (hasElement('decay-slider')) {
    let decaySliderController = new _controller_range_controller_js__WEBPACK_IMPORTED_MODULE_3__["default"]('decay-slider');
    decaySliderController.animate = false;
    decaySliderController.onValueChange.push(val => {
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.decayTimeSet)(val);
    });
    _midi_js__WEBPACK_IMPORTED_MODULE_5__.decayCC.push(val => {
      decaySliderController.slider.value = val;
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.decayTimeSet)(val);
    });
    controllers.push(decaySliderController);
  }

  if (hasElement('drive-slider')) {
    let driveSliderController = new _controller_range_controller_js__WEBPACK_IMPORTED_MODULE_3__["default"]('drive-slider');
    driveSliderController.animate = false;
    driveSliderController.onValueChange.push(val => {
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.drive)(val);
    });
    _midi_js__WEBPACK_IMPORTED_MODULE_5__.driveCC.push(val => {
      driveSliderController.slider.value = val;
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.drive)(val);
    });
    controllers.push(driveSliderController);
  }

  if (hasElement('master-slider')) {
    let masterSliderController = new _controller_range_controller_js__WEBPACK_IMPORTED_MODULE_3__["default"]('master-slider');
    masterSliderController.animate = false;
    masterSliderController.onValueChange.push(val => {
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.masterVolume)(val);
    });
    _midi_js__WEBPACK_IMPORTED_MODULE_5__.masterVolCC.push(val => {
      masterSliderController.slider.value = val;
      (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.masterVolume)(val);
    });
    controllers.push(masterSliderController);
  }

  (0,_synth_js__WEBPACK_IMPORTED_MODULE_4__.initAudioContext)();
  (0,_midi_js__WEBPACK_IMPORTED_MODULE_5__.connectMidi)();
  conductor = new _conductor_js__WEBPACK_IMPORTED_MODULE_0__["default"](controllers);
  conductor.start(); // To let me play around with things in the console.

  window.conductor = conductor;
}

function hasElement(id) {
  return document.getElementById(id) != null;
} // /**
//  * Configure the canvases to be able to handle screens with higher dpi.
//  *
//  * We can only call this once because after that, the width has changed!
//  */
// function updateCanvasSizes() {
//     const pixelRatio = window.devicePixelRatio || 1;
//     const canvases = document.getElementsByTagName("canvas");
//     for (let canvas of canvases) {
//         const width = canvas.width;
//         const height = canvas.height;
//         canvas.width = width * pixelRatio;
//         canvas.height = height * pixelRatio;
//         canvas.style.width = width + 'px';
//         canvas.style.height = height + 'px';
//     }
// }
// updateCanvasSizes();


init();
})();

/******/ })()
;
//# sourceMappingURL=main.bundle.js.map