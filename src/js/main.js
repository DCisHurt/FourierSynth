import Conductor from './conductor.js';
import WaveSplitController from './controller/wave-split-controller.js';
import WaveDrawController from './controller/wave-draw-controller.js';

import { stopSoundWave, playSoundWave, updateBuffer, initAudioContext, delayTime, delayWet
, filterCutoff, filterResonance, drive, masterVolume, attackTimeSet, decayTimeSet } from './synth.js';

import { connectMidi, note2Frequency, nPiontsCC, cutoffCC, resonanceCC, delayTimeCC, delayWetCC,
         attackCC, decayCC, driveCC, masterVolCC, knobHighlight, octaveChange } from './midi.js';
let conductor = null;

let knobNFFT = document.getElementById("knob-nfft")
let knobCutoff = document.getElementById("knob-cutoff")
let knobResonance = document.getElementById("knob-resonance")
let knobAttack = document.getElementById("knob-attack")
let knobDecay = document.getElementById("knob-decay")
let knobDelayTime = document.getElementById("knob-delay-time")
let knobDelayWet = document.getElementById("knob-delay-wet")
let knobDrive = document.getElementById("knob-drive")
let knobMasterVol = document.getElementById("knob-master")

let knobs = [knobNFFT, knobCutoff, knobResonance, knobAttack, knobDecay, 
    knobDelayTime, knobDelayWet, knobDrive, knobMasterVol]
let octave = 0;

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

                knobNFFT.min = 0
                knobNFFT.max = 1.0
                knobNFFT.value = 1
                knobNFFT.step = 0.01
                knobNFFT.tooltip = "FFT points"
                knobNFFT.conv="(x*128).toFixed(0)"
                knobNFFT.addEventListener("input", (event)=>{
                    waveDrawSplitController.fourierAmt = event.target.value;
                    waveDrawSplitController.splitAnim = false;
                    updateBuffer(waveDrawSplitController.partialWave);
                    console.log(`nFFT:${Math.round(event.target.value*128)}`);
                });
                nPiontsCC.push(val => {
                    highlightKnob(0);
                    knobNFFT.value = val;
                    waveDrawSplitController.fourierAmt = val;
                    waveDrawSplitController.splitAnim = false;
                    updateBuffer(waveDrawSplitController.partialWave);
                    console.log(`nFFT:${Math.round(val*128)}`);
                });
                waveDrawController.onDrawingStart.push(() => {
                    knobNFFT.value = 1;
                    console.log(`nFFT:128`);
                });
                waveDrawController.onDrawingEnd.push(() => {
                    knobNFFT.value = 1;
                    console.log(`nFFT:128`);
                });
            }
        }
        controllers.push(waveDrawSplitController);
    }

    if (hasElement('knob-cutoff')) {

        knobCutoff.min = 0
        knobCutoff.max = 1.0
        knobCutoff.value = 1
        knobCutoff.step = 0.01
        knobCutoff.tooltip = "Cutoff"
        knobCutoff.conv="(Math.pow(10, x * 2) * 240).toFixed(0) + ' Hz'"
        knobCutoff.addEventListener("input", (event)=>{
            filterCutoff(event.target.value);
        });
        cutoffCC.push(val => {
            highlightKnob(1);
            knobCutoff.value = val;
            filterCutoff(val);
        });
    }

    if (hasElement('knob-resonance')) {

        knobResonance.min = 0
        knobResonance.max = 1.0
        knobResonance.value = 1
        knobResonance.step = 0.01
        knobResonance.tooltip = "Resonance"
        knobResonance.conv="((x * 20) + 1.0).toFixed(1)"
        knobResonance.addEventListener("input", (event)=>{
            filterResonance(event.target.value);
        });
        resonanceCC.push(val => {
            highlightKnob(2);
            knobResonance.value = val;
            filterResonance(val);
        });
    }

    if (hasElement('knob-attack')) {

        knobAttack.min = 0
        knobAttack.max = 1.0
        knobAttack.value = 0.05
        knobAttack.step = 0.01
        knobAttack.tooltip = "Attack"
        knobAttack.conv="(x*2).toFixed(2)+ 's'"
        knobAttack.addEventListener("input", (event)=>{
            attackTimeSet(event.target.value);
        });
        attackCC.push(val => {
            highlightKnob(3);
            knobAttack.value = val;
            attackTimeSet(val);
        });
    }

    if (hasElement('knob-decay')) {
        
        knobDecay.min = 0
        knobDecay.max = 1.0
        knobDecay.value = 0.25
        knobDecay.step = 0.01
        knobDecay.tooltip = "Decay"
        knobDecay.conv="(x*2).toFixed(2)+ 's'"
        knobDecay.addEventListener("input", (event)=>{
            decayTimeSet(event.target.value);
        });
        decayCC.push(val => {
            highlightKnob(4);
            knobDecay.value = val;
            decayTimeSet(val);
        });
    }

    if (hasElement('knob-delay-time')) {
        
        knobDelayTime.min = 0
        knobDelayTime.max = 1.0
        knobDelayTime.value = 0.3
        knobDelayTime.step = 0.01
        knobDelayTime.tooltip = "Delay Time"
        knobDelayTime.conv="(x*2).toFixed(2)+ 's'"
        knobDelayTime.addEventListener("input", (event)=>{
            delayTime(event.target.value);
        });
        delayTimeCC.push(val => {
            highlightKnob(5);
            knobDelayTime.value = val;
            delayTime(val);
        });
    }

    if (hasElement('knob-delay-wet')) {
        
        knobDelayWet.min = 0
        knobDelayWet.max = 1.0
        knobDelayWet.value = 0.3
        knobDelayWet.step = 0.01
        knobDelayWet.tooltip = "Delay Wet"
        knobDelayWet.conv="(x*100).toFixed(0) + '%'"
        knobDelayWet.addEventListener("input", (event)=>{
            delayWet(event.target.value);
        });
        delayWetCC.push(val => {
            highlightKnob(6);
            knobDelayWet.value = val;
            delayWet(val);
        });
    }

    if (hasElement('knob-drive')) {
        
        knobDrive.min = 0
        knobDrive.max = 1.0
        knobDrive.value = 0
        knobDrive.step = 0.01
        knobDrive.tooltip = "Drive"
        knobDrive.conv="(x*10).toFixed(1)"
        knobDrive.addEventListener("input", (event)=>{
            drive(event.target.value);
        });
        driveCC.push(val => {
            highlightKnob(7);
            knobDrive.value = val;
            drive(val);
        });
    }

    if (hasElement('knob-master')) {
        
        knobMasterVol.min = 0
        knobMasterVol.max = 1.0
        knobMasterVol.value = 0.75
        knobMasterVol.step = 0.01
        knobMasterVol.tooltip = "Master Vol"
        knobMasterVol.conv="(x*10).toFixed(1)"
        knobMasterVol.addEventListener("input", (event)=>{
            masterVolume(event.target.value);
        });
        masterVolCC.push(val => {
            highlightKnob(8);
            knobMasterVol.value = val;
            masterVolume(val);
        });
    }

    if (hasElement('sw')) {
        let switchOctave = document.getElementById("sw")

        switchOctave.sprites = 4
        switchOctave.value = 0
        switchOctave.min = -2
        switchOctave.max = 2
        switchOctave.height = 20
        switchOctave.valuetip = 0
        // switchOctave.tooltip = "Octave"
        // switchOctave.conv="(x)"
        switchOctave.addEventListener("input", (event)=>{
            octave = event.target.value;
            octaveChange(octave);
        });
    }

    if (hasElement('keyboard')) {
        let kb = document.getElementById("keyboard")
        let ratio = window.innerWidth/window.innerHeight
        
        if(ratio < 1.6){
            kb.width = Math.round(window.innerWidth * 0.6)
            kb.height = Math.round(kb.width * 0.3)
        }
        else{
            kb.width = Math.round(window.innerWidth * 0.75)
            kb.height = Math.round(kb.width * 0.29)
        }
        window.addEventListener("resize", (event) => {
            let ratio = window.innerWidth/window.innerHeight
            
            if(ratio < 1.6){
                kb.width = Math.round(window.innerWidth * 0.6)
                kb.height = Math.round(kb.width * 0.3)
            }
            else{
                kb.width = Math.round(window.innerWidth * 0.75)
                kb.height = Math.round(kb.width * 0.29)
            }
        });


        kb.addEventListener("change",(event)=>{
            let state = event.note[0]
            let note = event.note[1]
            if(state){
                playSoundWave(note, note2Frequency(note+octave*12));
            }
            else{
                stopSoundWave(note);
            }
        });
    }

    knobHighlight.push(val => {
        highlightKnob(val);
        console.log(`Knob Highlight: ${val}`);
    });
    
    initAudioContext();
    connectMidi();

    conductor = new Conductor(controllers);
    conductor.start();
    // To let me play around with things in the console.
    window.conductor = conductor;
}

function highlightKnob(index) {
    for(let i = 0; i < knobs.length; i++){
        knobs[i].diameter = 64
    }
    knobs[index].diameter = 80
}


function hasElement(id) {
    return document.getElementById(id) != null;
}

init();