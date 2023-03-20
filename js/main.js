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

import Conductor from './conductor.js';
import WaveSplitController from './controller/wave-split-controller.js';
import WaveDrawController from './controller/wave-draw-controller.js';
import RangeController from './controller/range-controller.js';
import { playSoundWave } from './synth.js';



let conductor = null;

function init() {

    let controllers = [];

    let waveDrawController, waveDrawSliderController, waveDrawButton, waveDrawSplitController;
    if (hasElement('wave-draw')) {
        waveDrawController = new WaveDrawController('wave-draw');
        controllers.push(waveDrawController);
    }
    if (hasElement('wave-draw-instruction')) {
        const instruction = document.getElementById('wave-draw-instruction');
        if (waveDrawController) {
            waveDrawController.onDrawingStart.push(() => instruction.classList.add('hidden'))
        }
    }
    if (hasElement('wave-draw-slider')) {
        waveDrawSliderController = new RangeController('wave-draw-slider');
        waveDrawSliderController.animate = false;
        controllers.push(waveDrawSliderController);
    }
    if (hasElement('wave-draw-split')) {
        waveDrawSplitController = new WaveSplitController('wave-draw-split');
        if (waveDrawController != null) {
            waveDrawController.onDrawingStart.push(() => {
                waveDrawSplitController.splitAnim = true;
                waveDrawSplitController.setPath([]);
            });
            waveDrawController.onDrawingEnd.push(() => {
                waveDrawSplitController.splitAnim = true;
                waveDrawSplitController.setPath(waveDrawController.normPath);
            });
            // Reset the slider back to 1 when the wave changes to draw the full wave.
            if (waveDrawSliderController) {
                waveDrawController.onDrawingStart.push(() => waveDrawSliderController.slider.value = 1);
                waveDrawController.onDrawingEnd.push(() => waveDrawSliderController.slider.value = 1);
            }
        }
        if (waveDrawSliderController != null) {
            waveDrawSliderController.onValueChange.push(val => {
                waveDrawSplitController.fourierAmt = val;
                waveDrawSplitController.splitAnim = false;
            });
        }
        controllers.push(waveDrawSplitController);
    }
    if (hasElement('wave-draw-button')) {
        const button = document.getElementById('wave-draw-button');
        if (button) {
            button.addEventListener('click', () => playSoundWave(waveDrawSplitController.partialWave));
        }
    }
    
    conductor = new Conductor(controllers);
    conductor.start();
    // To let me play around with things in the console.
    window.conductor = conductor;
}

function hasElement(id) {
    return document.getElementById(id) != null;
}

// /**
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