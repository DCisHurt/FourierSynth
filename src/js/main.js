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
import { stopSoundWave, playSoundWave, updateBuffer, initAudioContext, delayTime, delayWet
, filterCutoff, filterResonance, drive, masterVolume, attackTimeSet, decayTimeSet } from './synth.js';

import { connectMidi, nPiontsCC, cutoffCC, resonanceCC, delayTimeCC, delayWetCC,
         attackCC, decayCC, driveCC, masterVolCC } from './midi.js';
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
                updateBuffer(waveDrawSplitController.partialWave);
            });
            waveDrawController.onDrawingEnd.push(() => {
                waveDrawSplitController.splitAnim = true;
                waveDrawSplitController.setPath(waveDrawController.normPath);
                updateBuffer(waveDrawSplitController.partialWave);
            });
            // Reset the slider back to 1 when the wave changes to draw the full wave.
            if (waveDrawSliderController) {
                waveDrawController.onDrawingStart.push(() => {
                    waveDrawSliderController.slider.value = 1;
                    waveDrawSplitController.fourierAmt = 1;
                });
                waveDrawController.onDrawingEnd.push(() =>
                {
                    waveDrawSliderController.slider.value = 1;
                    waveDrawSplitController.fourierAmt = 1;
                });
            }
        }
        if (waveDrawSliderController != null) {
            nPiontsCC.push(val => {
                waveDrawSplitController.fourierAmt = val;
                waveDrawSplitController.splitAnim = false;
                waveDrawSliderController.slider.value = val;
                updateBuffer(waveDrawSplitController.partialWave);
            });
            waveDrawSliderController.onValueChange.push(val => {
                waveDrawSplitController.fourierAmt = val;
                waveDrawSplitController.splitAnim = false;
                updateBuffer(waveDrawSplitController.partialWave);
            });
        }
        controllers.push(waveDrawSplitController);
    }
    if (hasElement('wave-draw-button')) {
        const button = document.getElementById('wave-draw-button');
        if (button) {
            button.addEventListener('mousedown', () => playSoundWave(0, 260));
            button.addEventListener('mouseout', () => stopSoundWave(0));
            button.addEventListener('mouseup', () => stopSoundWave(0));
        }
    }

    if (hasElement('cutoff-slider')) {
        let cutoffSliderController = new RangeController('cutoff-slider');
        cutoffSliderController.animate = false;
        cutoffSliderController.onValueChange.push(val => {
            filterCutoff(val);
        });
        cutoffCC.push(val => {
            cutoffSliderController.slider.value = val;
            filterCutoff(val);
        });
        controllers.push(cutoffSliderController);
    }

    if (hasElement('resonance-slider')) {
        let resonanceSliderController = new RangeController('resonance-slider');
        resonanceSliderController.animate = false;
        resonanceSliderController.onValueChange.push(val => {
            filterResonance(val);
        });
        resonanceCC.push(val => {
            resonanceSliderController.slider.value = val;
            filterResonance(val);
        });
        controllers.push(resonanceSliderController);
    }

    if (hasElement('delay-time-slider')) {
        let delayTimeSliderController = new RangeController('delay-time-slider');
        delayTimeSliderController.animate = false;     
        delayTimeSliderController.onValueChange.push(val => {
            delayTime(val);
        });
        delayTimeCC.push(val => {
            delayTimeSliderController.slider.value = val;
            delayTime(val);
        });
        controllers.push(delayTimeSliderController);
    }

    if (hasElement('delay-wet-slider')) {
        let delayWetSliderController = new RangeController('delay-wet-slider'); 
        delayWetSliderController.animate = false;
        delayWetSliderController.onValueChange.push(val => {
            delayWet(val);
        });
        delayWetCC.push(val => {
            delayWetSliderController.slider.value = val;
            delayWet(val);
        });
        controllers.push(delayWetSliderController);
    }

    if (hasElement('attack-slider')) {
        let attackSliderController = new RangeController('attack-slider');
        attackSliderController.animate = false;
        attackSliderController.onValueChange.push(val => {
            attackTimeSet(val);
        });
        attackCC.push(val => {
            attackSliderController.slider.value = val;
            attackTimeSet(val);
        });
        controllers.push(attackSliderController);
    }

    if (hasElement('decay-slider')) {
        let decaySliderController = new RangeController('decay-slider');
        decaySliderController.animate = false;
        decaySliderController.onValueChange.push(val => {
            decayTimeSet(val);
        });
        decayCC.push(val => {
            decaySliderController.slider.value = val;
            decayTimeSet(val);
        });
        controllers.push(decaySliderController);
    }

    if (hasElement('drive-slider')) {
        let driveSliderController = new RangeController('drive-slider');
        driveSliderController.animate = false;
        driveSliderController.onValueChange.push(val => {
            drive(val);
        });
        driveCC.push(val => {
            driveSliderController.slider.value = val;
            drive(val);
        });
        controllers.push(driveSliderController);
    }

    if (hasElement('master-slider')) {
        let masterSliderController = new RangeController('master-slider');
        masterSliderController.animate = false;
        masterSliderController.onValueChange.push(val => {
            masterVolume(val);
        });
        masterVolCC.push(val => {
            masterSliderController.slider.value = val;
            masterVolume(val);
        });
        controllers.push(masterSliderController);
    }
    

    initAudioContext();
    connectMidi();

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