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
var rafID = null;
var meter = null;
var canvasContext = null;
let canvasW;
let canvasH;

export function initAudioContext() {
    if (audioContext === null) {   
        audioContext = new AudioContext();
    }
    let canvas = document.getElementById("meter")
    canvasW = canvas.width;
    canvasH = canvas.height;

    canvasContext = canvas.getContext("2d");

    Filter = audioContext.createBiquadFilter();
    Filter.type = "lowpass";
    filterCutoff(1);
    filterResonance(1);

    Delay = audioContext.createDelay(5.0);
    DelayFeedback = audioContext.createGain();
    DelayGain = audioContext.createGain();
    delayTime(0.3);
    delayFeedback(0.8);
    delayWet(0.3);

    Distortion = audioContext.createWaveShaper();
    drive(0);

    MasterVol = audioContext.createGain();
    masterVolume(0.75);

    Distortion.connect(Filter);
    Filter.connect(Delay);
    Delay.connect(DelayGain);
    DelayGain.connect(DelayFeedback);
    DelayFeedback.connect(Delay);
    DelayGain.connect(MasterVol);
    Filter.connect(MasterVol);
    
    MasterVol.connect(audioContext.destination);

    meter = createAudioMeter(audioContext);
    MasterVol.connect(meter);

    onLevelChange();
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
    }
}


export function playSoundWave(ch, pitch) {
    if(osc[ch] == null){
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
    value = Math.round(value * 200) / 100;
    attackTime = value;
    console.log(`Attack Time : ${attackTime}s`);
}

export function decayTimeSet(value) {
    value = Math.round(value * 200) / 100;
    decayTime = value;
    console.log(`Decay Time : ${decayTime}s`);
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
    Delay.delayTime.setValueAtTime(time*2, audioContext.currentTime);
    console.log(`Delay Time : ${Math.round(time*200)/100}s`);
}

function delayFeedback(value){
    DelayFeedback.gain.setValueAtTime(value, audioContext.currentTime);
}

export function delayWet(value){
    DelayGain.gain.setValueAtTime(value, audioContext.currentTime);
    console.log(`Delay Wet : ${Math.round(value*100)}%`);
}

export function filterCutoff(value){
    let freq = Math.round(Math.pow(10, value * 2) * 240);
    Filter.frequency.value = freq;
    console.log(`Filter Cut Off : ${freq}Hz`);
}

export function filterResonance(value){
    let Q =Math.round(((value * 20) + 1)*100) / 100;
    Filter.Q.value = Q
    console.log(`Filter Resonance : ${Q}`);
}

export function masterVolume(value){
    value = Math.round(value * 100) / 100;
    MasterVol.gain.setValueAtTime(value, audioContext.currentTime);
    console.log(`Master Volume : ${Math.round(value*100)}%`);
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
    console.log(`Drive : ${Math.round(amount*100)}%`);
    amount = Math.round(amount*500);
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


function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
	var processor = audioContext.createScriptProcessor(512);
	processor.onaudioprocess = volumeAudioProcess;
	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 0;
	processor.clipLevel = clipLevel || 0.98;
	processor.averaging = averaging || 0.95;
	processor.clipLag = clipLag || 750;

	// this will have no effect, since we don't copy the input to the output,
	// but works around a current Chrome bug.
	processor.connect(audioContext.destination);

	processor.checkClipping =
		function(){
			if (!this.clipping)
				return false;
			if ((this.lastClip + this.clipLag) < window.performance.now())
				this.clipping = false;
			return this.clipping;
		};

	processor.shutdown =
		function(){
			this.disconnect();
			this.onaudioprocess = null;
		};

	return processor;
}

function volumeAudioProcess( event ) {
	var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
	var sum = 0;
    var x;

	// Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
    	x = buf[i];
    	if (Math.abs(x)>=this.clipLevel) {
    		this.clipping = true;
    		this.lastClip = window.performance.now();
    	}
        if(x < 0.000001) { x = 0; }
    	sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
}


function onLevelChange( time ) {
    // // clear the background
    canvasContext.clearRect(0,0,canvasW,canvasH);

    let vol = 0

    if(meter.volume > 0.0001){
        vol = meter.volume * 5
    }

    let barCount = 15
    let barGap = 0.01 * canvasW

    canvasContext.shadowBlur = 5

    // draw a bar based on the current volume
    for (let i = 0; i < barCount; i++) {
        canvasContext.beginPath()
        canvasContext.shadowColor = canvasContext.fillStyle = getBoxColor(i, vol, barCount)
        let width = canvasW / (barCount + 1) - barGap
        canvasContext.fillRect(barGap*(i+1) + width*i, canvasH*0.1, width, canvasH*0.8)
    }

    // set up the next visual callback
    rafID = window.requestAnimationFrame( onLevelChange );
}


function getBoxColor(i, volume, barCount){

    let h = 99

    if(i > barCount * 0.65){
        h = 48
    }

    if(i > barCount * 0.8){
        h = 0
    }

    let l = 13

    if(i / barCount < volume){
        l = 50
    }

    return `hsl(${h}, 50%, ${l}%)`
}
