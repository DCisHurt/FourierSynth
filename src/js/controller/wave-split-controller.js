import CanvasController from "./canvas-controller.js";
import { slurp } from "../util.js";
import { getRealFourierData } from "../just-fourier-things.js";
import { palette } from "../color.js";
import { renderWave } from "../wave-things.js";

const transitionFactor = (1 / 15);

export default class WaveSplitController extends CanvasController {

    constructor(id, width, height) {
        super(id, width, height);

        this.animAmt = 0;
        this.wavePoints = [];
        this.partialWave = [];
        this.fourierPoints = [];

        this.onFourierChange = []

        this.waveTop = 0;
        this.waveBottom = 0;
        this.totalHeight = 0;
        this.fadeFrequencies = true;
        this.splitAnim = true;
        // How many of the waves to draw
        this.fourierAmt = 1;
    }

    setPath(path) {
        // Update the wave points. For the sake of removing the constant term in the FFT,
        // Set the mean to be 0.
        const pathAverage = path.reduce((a, b) => a + b, 0) / path.length;
        this.wavePoints = path.map(p => p - pathAverage);
        // Calculate fourier points, and drop the small things.
        this.fourierData = getRealFourierData(this.wavePoints).filter(f => f.amplitude > 0.001);
        this.fourierData.sort((a, b) => b.amplitude - a.amplitude);

        // Calculate the heights of the main wave and all the sine things
        this.waveTop = Math.min(...this.wavePoints);
        this.waveBottom = Math.max(...this.wavePoints);

        // Total height. Start with the main wave...
        this.totalHeight = this.waveBottom - this.waveTop;
        // Then add all the sine thingos
        this.fourierData.forEach((el) => this.totalHeight += 2 * el.amplitude);

        // reset the animation too
        this.animAmt = 0;
        this.splitAmt = 0;

        this.onFourierChange.forEach(fn => fn());
    }

    update(dt, mousePosition) {
        const period = 7;
        this.animAmt += dt / period;
        this.animAmt %= 1;

        const pos = this.getScrollPosition();
        let desiredSplitAmt = 0;
        if (pos < 0.7) {
            desiredSplitAmt = 1;
        }
        this.splitAmt += transitionFactor * (desiredSplitAmt - this.splitAmt);
    }

    render() {
        this.clear();
        this.renderWaves();
    }

    renderWaves() {
        if (this.wavePoints.length == 0) {
            return;
        }
        this.context.strokeStyle = palette.cyan;
        this.context.lineWidth = 2;

        const numBabies = Math.min(50, this.fourierData.length);
        const top = 0.1 * this.context.canvas.height;
        const bottom = 0.9 * this.context.canvas.height;
        // TODO: also incorporate into the frequencies to scale that too?
        const sizeMultiple = (bottom - top) / this.totalHeight;
        const spacingMultiplier = 0.8;

        // Running thing that says where to draw each wave.
        let curWavePos = 0;

        let startXAmt = -this.animAmt;

        let splitAmt = 1;
        let fadeAmt = 1;
        if (this.splitAnim) {
            splitAmt = this.splitAmt;
            fadeAmt = splitAmt;
        }

        // Actually, we're going to skip drawing the main wave here and draw it later.
        curWavePos += this.waveBottom - this.waveTop;

        // Draw its little babies.
        // Also sum up their values to draw the partial wave.

        this.partialWave = this.wavePoints.slice().fill(0);
        const renderedBabies = Math.round(slurp(1, numBabies, this.fourierAmt));
        for (let babe = 0; babe < renderedBabies; babe ++) {
            let babeAmt = babe / (numBabies - 1);
            const waveData = this.fourierData[babe];
            curWavePos += waveData.amplitude;
            const wavePosition = slurp(-this.waveTop, curWavePos, splitAmt);

            // lets generate this wave hey
            // TODO: cache this?
            const wave = this.wavePoints.slice();
            for (let i = 0; i < this.wavePoints.length; i ++) {
                const iAmt = i / this.wavePoints.length;
                const fullWaveAmt = this.wavePoints[i];
                const sineAmt = waveData.amplitude * Math.cos(2 * Math.PI * waveData.freq * iAmt + waveData.phase);
                wave[i] = slurp(fullWaveAmt, sineAmt, splitAmt);

                // While we're here, update the partial wave
                this.partialWave[i] += wave[i];
            }

            this.context.beginPath();
            this.context.globalAlpha = fadeAmt;
            if (this.fadeFrequencies) {
                this.context.globalAlpha *= (1 - babeAmt);
            }
            renderWave({
                context: this.context,
                width: this.width,
                wave: wave,
                yPosition: top + sizeMultiple * wavePosition,
                yMultiple: sizeMultiple * spacingMultiplier,
                startXAmt: startXAmt
            });
            this.context.stroke();
            this.context.globalAlpha = 1;

            curWavePos += waveData.amplitude;
        }

        curWavePos = 0;
        curWavePos -= this.waveTop;
        if (this.fourierAmt == 1) {
            // Eh just make it the full wave.
            this.partialWave = this.wavePoints;
        }

        // Now, lets go back and draw the main wave
        // Draw the main boy
        this.context.strokeStyle = palette.blue;
        this.context.lineWidth = 2;
        this.context.beginPath();
        renderWave({
            context: this.context,
            width: this.width,
            wave: this.partialWave,
            yPosition: top + sizeMultiple * curWavePos,
            yMultiple: sizeMultiple * spacingMultiplier,
            startXAmt: startXAmt
        });
        this.context.stroke();
    }

}