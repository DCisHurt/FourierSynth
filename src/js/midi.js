import { playSoundWave, stopSoundWave, pitchShift, volumeShift } from './synth.js';

export let nPiontsCC = [];
export let cutoffCC = [];
export let resonanceCC = [];
export let delayTimeCC = [];
export let delayWetCC = [];
export let attackCC = [];
export let decayCC = [];
export let driveCC = [];
export let masterVolCC = [];

export function connectMidi() {

    navigator.requestMIDIAccess()
    .then(
        (midi) => midiReady(midi),
        (err) => console.log('Something went wrong', err));
}
  
function midiReady(midi) {
    // Also react to device changes.
    midi.addEventListener('statechange', (event) => initDevices(event.target));
    initDevices(midi); // see the next section!
}


function initDevices(midi) {
    // Reset.
    let midiIn = [];
    let midiOut = [];

    // MIDI devices that send you data.
    const inputs = midi.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        midiIn.push(input.value);
    }

    // MIDI devices that you send data to.
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
    const velocity = (event.data.length > 2) ? event.data[2] : 1;
    const cmd = event.data[0] >> 4;
    const channel = event.data[0] & 0x0F;
    const value = event.data[1];
    
    // Note that not all MIDI controllers send a separate NOTE_OFF command for every NOTE_ON.
    if (cmd === NOTE_OFF || (cmd === NOTE_ON && velocity === 0)) {
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, note off: pitch:${value}`);
        stopSoundWave(channel);
    } 
    else if (cmd === NOTE_ON) {
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, note on: pitch:${value}, velocity: ${velocity}`);
        playSoundWave(channel,note2Frequency(value));
    }
    else if (cmd === PITCH_BEND) {
        const bend = ((event.data[2] << 7) + event.data[1] - 8192) / 8192;
        // console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, pitch shift ${(bend * 12).toFixed(1)} semitones`);
        pitchShift(channel, bend);
    }
    else if (cmd === AFTER_TOUCH) {
        // console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, volume:${value}`);
        volumeShift(channel, value);
    }
    else if (cmd === CONTROL_CHANGE) {

        switch (value) {
            case 2:
                console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, nFFT:${velocity}`);
                nPiontsCC.forEach(fn => fn(velocity / 127));
                break;
            case 3:
                console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, Filter CutOff:${velocity}`);
                let freq = Math.round(Math.pow(10, (velocity / 127)*3) * 75);
                cutoffCC.forEach(fn => fn(freq));
                break;
            case 4:
                console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, Filter Resonance:${velocity}`);
                resonanceCC.forEach(fn => fn((velocity * 20 / 127) + 1));
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
    return 440 * Math.pow(2,(note-69)/12);
}
