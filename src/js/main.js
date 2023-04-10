import Conductor from './conductor.js';
import WaveSplitController from './controller/wave-split-controller.js';
import WaveDrawController from './controller/wave-draw-controller.js';

import { stopSoundWave, playSoundWave, updateBuffer, initAudioContext, delayTime, delayWet
, filterCutoff, filterResonance, drive, masterVolume, attackTimeSet, decayTimeSet } from './synth.js';

import { connectMidi, note2Frequency, nPiontsCC, cutoffCC, resonanceCC, delayTimeCC, delayWetCC,
         attackCC, decayCC, driveCC, masterVolCC } from './midi.js';
let conductor = null;

function init() {

    let controllers = [];
    let waveDrawController, waveDrawSplitController;

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
    if (hasElement('wave-draw-split')) {
        waveDrawSplitController = new WaveSplitController('wave-draw-split');
        if (waveDrawController != null) {
            waveDrawController.onDrawingStart.push(() => {
                waveDrawSplitController.splitAnim = true;
                waveDrawSplitController.setPath([]);
                waveDrawSplitController.fourierAmt = 1;
                updateBuffer(waveDrawSplitController.partialWave);
            });
            waveDrawController.onDrawingEnd.push(() => {
                waveDrawSplitController.splitAnim = true;
                waveDrawSplitController.setPath(waveDrawController.normPath);
                waveDrawSplitController.fourierAmt = 1;
                updateBuffer(waveDrawSplitController.partialWave);
            });
            // Reset the nfft back to 1 when the wave changes to draw the full wave.
            if (hasElement('knob-nfft')) {
                let knob = document.getElementById("knob-nfft")
                
                knob.min = 0
                knob.max = 1.0
                knob.value = 1
                knob.step = 0.01
                knob.tooltip = "FFT points"
                knob.conv="(x*128).toFixed(0)"
                knob.addEventListener("input", (event)=>{
                    waveDrawSplitController.fourierAmt = event.target.value;
                    waveDrawSplitController.splitAnim = false;
                    updateBuffer(waveDrawSplitController.partialWave);
                    console.log(`nFFT:${Math.round(event.target.value*128)}`);
                });
                nPiontsCC.push(val => {
                    knob.value = val;
                    waveDrawSplitController.fourierAmt = val;
                    waveDrawSplitController.splitAnim = false;
                    updateBuffer(waveDrawSplitController.partialWave);
                    console.log(`nFFT:${Math.round(val*128)}`);
                });
                waveDrawController.onDrawingStart.push(() => {
                    knob.value = 1;
                    console.log(`nFFT:128`);
                });
                waveDrawController.onDrawingEnd.push(() => {
                    knob.value = 1;
                    console.log(`nFFT:128`);
                });
            }
        }
        controllers.push(waveDrawSplitController);
    }

    if (hasElement('knob-cutoff')) {
        let knob = document.getElementById("knob-cutoff")
        
        knob.min = 0
        knob.max = 1.0
        knob.value = 1
        knob.step = 0.01
        knob.tooltip = "Cutoff"
        knob.conv="(Math.pow(10, x * 2) * 240).toFixed(0) + ' Hz'"
        knob.addEventListener("input", (event)=>{
            filterCutoff(event.target.value);
        });
        cutoffCC.push(val => {
            knob.value = val;
            filterCutoff(val);
        });
    }

    if (hasElement('knob-resonance')) {
        let knob = document.getElementById("knob-resonance")
        
        knob.min = 0
        knob.max = 1.0
        knob.value = 1
        knob.step = 0.01
        knob.tooltip = "Resonance"
        knob.conv="((x * 20) + 1.0).toFixed(1)"
        knob.addEventListener("input", (event)=>{
            filterResonance(event.target.value);
        });
        resonanceCC.push(val => {
            knob.value = val;
            filterResonance(val);
        });
    }

    if (hasElement('knob-attack')) {
        let knob = document.getElementById("knob-attack")
        
        knob.min = 0
        knob.max = 1.0
        knob.value = 0.05
        knob.step = 0.01
        knob.tooltip = "Attack"
        knob.conv="(x*2).toFixed(2)+ 's'"
        knob.addEventListener("input", (event)=>{
            attackTimeSet(event.target.value);
        });
        attackCC.push(val => {
            knob.value = val;
            attackTimeSet(val);
        });
    }

    if (hasElement('knob-decay')) {
        let knob = document.getElementById("knob-decay")
        
        knob.min = 0
        knob.max = 1.0
        knob.value = 0.25
        knob.step = 0.01
        knob.tooltip = "Decay"
        knob.conv="(x*2).toFixed(2)+ 's'"
        knob.addEventListener("input", (event)=>{
            decayTimeSet(event.target.value);
        });
        decayCC.push(val => {
            knob.value = val;
            decayTimeSet(val);
        });
    }

    if (hasElement('knob-delay-time')) {
        let knob = document.getElementById("knob-delay-time")
        
        knob.min = 0
        knob.max = 1.0
        knob.value = 0.3
        knob.step = 0.01
        knob.tooltip = "Delay Time"
        knob.conv="(x*2).toFixed(2)+ 's'"
        knob.addEventListener("input", (event)=>{
            delayTime(event.target.value);
        });
        delayTimeCC.push(val => {
            knob.value = val;
            delayTime(val);
        });
    }

    if (hasElement('knob-delay-wet')) {
        let knob = document.getElementById("knob-delay-wet")
        
        knob.min = 0
        knob.max = 1.0
        knob.value = 0.3
        knob.step = 0.01
        knob.tooltip = "Delay Wet"
        knob.conv="(x*100).toFixed(0) + '%'"
        knob.addEventListener("input", (event)=>{
            delayWet(event.target.value);
        });
        delayWetCC.push(val => {
            knob.value = val;
            delayWet(val);
        });
    }

    if (hasElement('knob-drive')) {
        let knob = document.getElementById("knob-drive")
        
        knob.min = 0
        knob.max = 1.0
        knob.value = 0
        knob.step = 0.01
        knob.tooltip = "Drive"
        knob.conv="(x*10).toFixed(1)"
        knob.addEventListener("input", (event)=>{
            drive(event.target.value);
        });
        driveCC.push(val => {
            knob.value = val;
            drive(val);
        });
    }

    if (hasElement('knob-master')) {
        let knob = document.getElementById("knob-master")
        
        knob.min = 0
        knob.max = 1.0
        knob.value = 0.75
        knob.step = 0.01
        knob.tooltip = "Master Vol"
        knob.conv="(x*10).toFixed(1)"
        knob.addEventListener("input", (event)=>{
            masterVolume(event.target.value);
        });
        masterVolCC.push(val => {
            knob.value = val;
            masterVolume(val);
        });
    }

    if (hasElement('keyboard')) {
        let kb = document.getElementById("keyboard")
        kb.width = Math.round(window.innerWidth * 0.75)
        kb.height = Math.round(window.innerHeight * 0.4)
        console.log(window.innerWidth)
        kb.addEventListener("change",(event)=>{
            let state = event.note[0]
            let note = event.note[1]
            if(state){
                playSoundWave(note, note2Frequency(note));
            }
            else{
                stopSoundWave(note);
            }
        });
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

init();