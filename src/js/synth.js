import { normaliseWave, getWaveFunction } from "./wave-things.js";
import FFT from './fft.js';


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

export function initAudioContext() {
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

export function updateBuffer(wave) {

    if (wave.length > 0) {
        const numPoints = wave.length;
        const fft = new FFT(numPoints);
    
        const formatedPoints = fft.createComplexArray();
        fft.toComplexArray(wave, formatedPoints);
    
        const out = fft.createComplexArray();
        fft.transform(out, formatedPoints);
        
        const l = out.length/2

        const real = new Float32Array(l);
        const imag = new Float32Array(l);

        for (let i = 0; i < l; i ++) {
            real[i] = out[i*2];
            imag[i] = out[i*2 + 1];
        }
        wave2 = audioContext.createPeriodicWave(real, imag);

        for (let i = 0; i < 16; i ++) {
            if(osc[i] != null){
                osc[i].setPeriodicWave(wave2);
            }
        }
        console.log("update");
    }
}


export function playSoundWave(ch, pitch) {

    osc[ch] = audioContext.createOscillator();
    gain[ch] = audioContext.createGain();

    osc[ch].setPeriodicWave(wave2);
    

    osc[ch].frequency.setValueAtTime(pitch, audioContext.currentTime);
    
    gain[ch].gain.setValueAtTime(0, audioContext.currentTime);
    gain[ch].gain.linearRampToValueAtTime(0.5, audioContext.currentTime + attackTime);
    gain[ch].gain.setTargetAtTime(0.5, audioContext.currentTime + attackTime, decayTime);

    osc[ch].connect(gain[ch]);

    if(DistortionOn){
        gain[ch].connect(Distortion);
    }
    else{
        gain[ch].connect(Filter);
    }
    
    osc[ch].start();

}


export function stopSoundWave(ch) {
    if(osc[ch] != null){
        gain[ch].gain.cancelScheduledValues(audioContext.currentTime);
        gain[ch].gain.setValueAtTime(gain[ch].gain.value, audioContext.currentTime);
        gain[ch].gain.linearRampToValueAtTime(0, audioContext.currentTime + decayTime);
        osc[ch].stop(audioContext.currentTime + decayTime);
        osc[ch] = null;
    }
}

export function attackTimeSet(value) {
    value = Math.round(value * 100) / 100;
    attackTime = value;
}

export function decayTimeSet(value) {
    value = Math.round(value * 100) / 100;
    decayTime = value;
}

export function pitchShift(ch, pitch) {
    if(osc[ch] != null){
        osc[ch].detune.setValueAtTime(pitch * 1200 * 2, audioContext.currentTime);
    }
}

export function volumeShift(ch, vol) {
    if(osc[ch] != null){
        // gain[ch].gain.setValueAtTime(vol / 127, audioContext.currentTime);
        gain[ch].gain.linearRampToValueAtTime(vol / 127, audioContext.currentTime + attackTime);
    }
}

export function delayTime(time){
    Delay.delayTime.setValueAtTime(time, audioContext.currentTime);
}

function delayFeedback(value){
    DelayFeedback.gain.setValueAtTime(value, audioContext.currentTime);
}

export function delayWet(value){
    DelayGain.gain.setValueAtTime(value, audioContext.currentTime);
}

export function filterCutoff(value){
    Filter.frequency.value = value;
}

export function filterResonance(value){
    Filter.Q.value = value;
}

export function masterVolume(value){
    MasterVol.gain.setValueAtTime(value, audioContext.currentTime);
}

// async function createReverb() {
//     let convolver = audioContext.createConvolver();
  
//     // load impulse response from file
//     let response = await fetch("js/irRoom.wav");
//     let arraybuffer = await response.arrayBuffer();
//     convolver.buffer = await audioContext.decodeAudioData(arraybuffer);
  
//     return convolver;
// }

export function drive(amount) {
    amount = Math.round(amount);
    if(amount < 1){
        DistortionOn = false;
    }
    else{
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
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}
