import { playSoundWave, stopSoundWave, pitchShift } from './synth.js';


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
    const velocity = (event.data.length > 2) ? event.data[2] : 1;
    const cmd = event.data[0] >> 4;
    const channel = event.data[0] & 0x0F;
    const pitch = event.data[1]+12;
    
    // Note that not all MIDI controllers send a separate NOTE_OFF command for every NOTE_ON.
    if (cmd === NOTE_OFF || (cmd === NOTE_ON && velocity === 0)) {
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, note off: pitch:${pitch}`);
        stopSoundWave(channel);
    } 
    else if (cmd === NOTE_ON) {
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, note on: pitch:${pitch}, velocity: ${velocity}`);
        playSoundWave(channel,note2Frequency(pitch));
    }
    else if (cmd === PITCH_BEND) {
        const bend = ((event.data[2] << 7) + event.data[1] - 8192) / 8192;
        console.log(`🎧 from ${event.srcElement.name}, channel: ${channel}, pitch shift ${(bend * 12).toFixed(1)} semitones`);
        pitchShift(channel, bend);
    }
}


function note2Frequency(note) {
    return 440 * Math.pow(2,(note-69)/12);
}
