# Fourier Synth

This is a browser-based midi synthesiser with custom wave sources. This project aim to demonstrate a new way of controlling timbre. The timbre is controlled by changing the signal content of the waveform adjusted by the FFT points.

The interactive canvas of waveforms was built by [Fourier](https://github.com/Jezzamonn/fourier) project. It is the source of the synthesiser signal. The rest of the signal processing is built on [Web Audio API](https://github.com/WebAudio/web-audio-api).

## Live Demo

A live demo is available [here](https://dcishurt.github.io/FourierSynth/).

## Features

- Support multiple controller including :
  - Mouse and Keyboard
  - Multi-touch devices
  - USB midi controller

- Built-in audio effects including :
  - `Envelope`
  - `Digital Delay`
  - `Overdrive`
  - `Lowpass Filter`

- Support MIDI Polyphonic Expression ([MPE](https://www.midi.org/midi-articles/midi-polyphonic-expression-mpe)) standard.

## How to play?

1. Draw a waveform on the interactive canvas and adjust the number of FFT points to obtain the base signal to be synthesised.

    ![draw](img/draw.gif)

2. Play with mouse, keyboard or usb midi controller.

3. Keyboard Mapping

    | Keyboard | Midi Note | Keyboard | Midi Note |
    | -------- | --------- | -------- | --------- |
    | `z`      | `36`      |          |           |
    | `x`      | `38`      | `s`      | `37`      |
    | `c`      | `40`      | `d`      | `39`      |
    | `v`      | `41`      |          |           |
    | `b`      | `43`      | `g`      | `42`      |
    | `n`      | `45`      | `h`      | `44`      |
    | `m`      | `47`      | `j`      | `46`      |
    | `q`      | `48`      |          |           |
    | `w`      | `50`      | `2`      | `49`      |
    | `e`      | `52`      | `3`      | `51`      |
    | `r`      | `53`      |          |           |
    | `t`      | `55`      | `5`      | `54`      |
    | `y`      | `57`      | `6`      | `56`      |
    | `u`      | `59`      | `7`      | `58`      |
    | `i`      | `60`      |          |           |

4. Midi CC Table

    | Parameter         | CC MSB      | CC LSB      | Range         |
    | ----------------  | ----------- | ----------- | ------------- |
    | `FFT points`      | `0x02`      | `0 - 127`   | `1 - 128`     |
    | `LPF Coutoff Freq`| `0x03`      | `0 - 127`   | `240 - 24KHz` |
    | `LPF Resonance`   | `0x04`      | `0 - 127`   | `1 - 21`      |
    | `Attack Time`     | `0x05`      | `0 - 127`   | `0 - 2s`      |
    | `Decay Time`      | `0x06`      | `0 - 127`   | `0 - 2s`      |
    | `Delay Time`      | `0x07`      | `0 - 127`   | `0 - 2s`      |
    | `Delay Dry/Wet`   | `0x08`      | `0 - 127`   | `0 - 100%`    |
    | `Overdrive`       | `0x09`      | `0 - 127`   | `0 - 100%`    |
    | `Master Volume`   | `0x0A`      | `0 - 127`   | `0 - 100%`    |

## Installation

1. Install [Node.js](https://nodejs.org/en/download)

2. Clone this repository

    ```cmd
    git clone https://github.com/DCisHurt/FourierSynth.git
    ```

3. Install depences

    ```cmd
    npm install
    ```

4. Optional : Use the Webpack tool to bundle all JavaScript files and generate static web page

    ```cmd
    webpack
    ```

## Credits

- [fourier](https://github.com/Jezzamonn/fourier)
- [web-audio-api](https://github.com/WebAudio/web-audio-api)
- [webaudio-controls](https://github.com/g200kg/webaudio-controls)

## License

MIT
