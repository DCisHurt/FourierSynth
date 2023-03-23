import { normaliseWave, getWaveFunction } from "./wave-things.js";
import FFT from './fft.js';


let audioContext = null;
let osc = [];


export function initAudioContext() {
    if (audioContext === null) {   
        audioContext = new AudioContext();
        for (let i = 0; i < 16; i ++) {
            osc[i] = audioContext.createOscillator();
            osc[i].start();
        }
    }
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
        const wave2 = audioContext.createPeriodicWave(real, imag);

        for (let i = 0; i < 16; i ++) {
            osc[i].setPeriodicWave(wave2);
        }
        console.log("update");
    }
    else{
        console.log("update fail");
    }

}


/**
 *
 * @param {function(number):number|Array<number>} wave
 */
export function playSoundWave(ch, pitch) {

    osc[ch].frequency.setValueAtTime(pitch, audioContext.currentTime);

    osc[ch].connect(audioContext.destination);
    console.log(`channel" ${ch} "on`);
    // if (buff.length == 0) {
    //     // Do nothing if we have a nothing-lengthed wave.
    //     return;
    // }
    // const baseVolume = 0.8;
    // const decay = 3;
    // if (buff.constructor === Array) {
    //     // transform our wave array into a function we can call
    //     buff = getWaveFunction(normaliseWave(buff));
    // }

    // const audioContext = getAudioContext();
    // if (audioContext === null) {
    //     return false;
    // }
    // const buffer = audioContext.createBuffer(1, SAMPLE_RATE * 3, SAMPLE_RATE);

    // const channel = buffer.getChannelData(0);
    // for (let i = 0; i < buffer.length; i ++) {
    //     // Where we are in the sound, in seconds.
    //     const t = i / SAMPLE_RATE;
    //     // The waves are visually at a very low frequency, we need to bump that up a bunch
    //     channel[i] += buff(pitch * t);
    // }
    // const source = audioContext.createBufferSource();
    // source.buffer = buffer;

    // const gainNode = audioContext.createGain();
    // gainNode.gain.setValueAtTime(baseVolume, audioContext.currentTime);
    // gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + decay);

    // source.connect(gainNode);
    // gainNode.connect(audioContext.destination);

    // source.start();
    // source.stop(audioContext.currentTime + decay);
}


export function stopSoundWave(ch) {
    osc[ch].disconnect(audioContext.destination);
}

export function pitchShift(ch, pitch) {
    osc[ch].detune.setValueAtTime(pitch * 1000, audioContext.currentTime);
}