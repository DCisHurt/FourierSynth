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
export let knobHighlight = [];

var highlight = 0;

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
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, note on: pitch:${value}`);
        playSoundWave(channel,note2Frequency(value));
    }
    else if (cmd === PITCH_BEND) {
        const bend = ((event.data[2] << 7) + event.data[1] - 8192) / 8192;
        pitchShift(channel, bend);
    }
    else if (cmd === AFTER_TOUCH) {
        volumeShift(channel, value);
    }
    else if (cmd === CONTROL_CHANGE) {
        switch (value) {
            case 2:
                nPiontsCC.forEach(fn => fn(velocity / 127));
                break;
            case 3:
                cutoffCC.forEach(fn => fn(velocity / 127));
                break;
            case 4:
                resonanceCC.forEach(fn => fn(velocity / 127));
                break;
            case 5:
                attackCC.forEach(fn => fn(velocity / 127));
                break;
            case 6:
                decayCC.forEach(fn => fn(velocity / 127));
                break;
            case 7:
                delayTimeCC.forEach(fn => fn(velocity / 127));
                break;
            case 8:
                delayWetCC.forEach(fn => fn(velocity / 127));
                break;
            case 9:
                driveCC.forEach(fn => fn(velocity / 127));
                break;
            case 10:
                masterVolCC.forEach(fn => fn(velocity / 127));
                break;
            case 11:
                highlight = velocity;
                knobHighlight.forEach(fn => fn(highlight));
                break;
            case 12:
                highlight = velocity;
                knobHighlight.forEach(fn => fn(highlight));
                break;
            default:
                break;
        }
    }
}


export function note2Frequency(note) {
    return 440 * Math.pow(2,(note-69)/12);
}
