import { playSoundWave } from './synth.js';


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

    const cmd = event.data[0] >> 4;
    const pitch = event.data[1];
    
    // Note that not all MIDI controllers send a separate NOTE_OFF command for every NOTE_ON.
    if (cmd === NOTE_OFF || (cmd === NOTE_ON && velocity === 0)) {
        const velocity = (event.data.length > 2) ? event.data[2] : 1;
        console.log(`🎧 from ${event.srcElement.name} note off: pitch:${pitch}, velocity: ${velocity}`);
    } 
    else if (cmd === NOTE_ON) {
        const velocity = (event.data.length > 2) ? event.data[2] : 1;
        console.log(`🎧 from ${event.srcElement.name} note on: pitch:${pitch}, velocity: ${velocity}`);
        playSoundWave(note2Frequency(pitch));
    }
    else if (cmd === PITCH_BEND) {
        const shiftDown = event.data[1];
        const shiftUP = event.data[2];
        if(shiftDown){
            console.log(`🎧 from ${event.srcElement.name} pitch shift donw:${shiftDown}`);
        }
        else{
            console.log(`🎧 from ${event.srcElement.name} pitch shift up:${shiftUP}`);
        }
        
    }
}


function note2Frequency(note) {
    return 440 * Math.pow(2,(note-69)/12);
}
