import CanvasController from "./canvas-controller.js";
import { slurp } from "../util.js";
import { palette } from "../color.js";

export default class WaveDrawController extends CanvasController {

    constructor(id, width, height) {
        super(id, width, height);
        // just a list
        this.wavePoints = new Array(128).fill(this.height / 2);

        this.drawing = false;
        this.onDrawingStart = [];
        this.onDrawingEnd = [];
        this.lastMousePoint = null;

        this.canvas.addEventListener('mousedown', () => this.startDrawing());
        this.canvas.addEventListener('touchstart', () => this.startDrawing());

        document.addEventListener('mouseup', () => this.stopDrawing());
        document.addEventListener('touchend', () => this.stopDrawing());

        // Prevent scrolling while we're drawing here
        this.canvas.addEventListener('touchmove', (evt) => evt.preventDefault(), {passive: false});
    }

    get normPath() {
        return this.wavePoints.map(el => el / this.height)
    }

    startDrawing() {
        this.drawing = true;
        this.lastMousePoint = null;

        this.onDrawingStart.forEach(fn => fn());
    }

    stopDrawing() {
        if (this.drawing) {
            this.drawing = false;
            this.lastMousePoint = null;

            this.onDrawingEnd.forEach(fn => fn());
        }
    }

     update(dt, mousePosition) {
        if (!mousePosition || !this.drawing) {
            return;
        }

        const canvasPosition = this.canvas.getBoundingClientRect();
        // we have to account for the border here too
        const actualWidth = (canvasPosition.right - canvasPosition.left) - 2;
        // 500 being the 'default' width
        const scale = 500 / actualWidth;
        const mousePoint = {
            x: scale * (mousePosition.x - canvasPosition.x),
            y: scale * (mousePosition.y - canvasPosition.y),
        }
        if (this.lastMousePoint == null) {
            this.lastMousePoint = mousePoint;
        }

        const xDiff = Math.abs(mousePoint.x - this.lastMousePoint.x);
        const pointsGap = this.width / this.wavePoints.length;
        const lerpPoints = 2 * Math.ceil(xDiff / pointsGap) + 1;
        for (let i = 0; i < lerpPoints; i ++) {
            const amt = (i - 1) / lerpPoints;

            const index = this.getNearestIndex(slurp(this.lastMousePoint.x, mousePoint.x, amt));
            this.wavePoints[index] = slurp(this.lastMousePoint.y, mousePoint.y, amt);
        }

        this.lastMousePoint = mousePoint;
    }

    /**
     * Gets the nearest index in the wave array to the x coord on the screen
     * @param {Number} x
     */
    getNearestIndex(x) {
        const xAmt = (x / this.width)
        let pos = Math.round(this.wavePoints.length * xAmt) % this.wavePoints.length;
        if (pos < 0) {
            pos += this.wavePoints.length;
        }
        return pos;
    }

    render() {
        this.clear();

        this.renderWave();
    }

    renderWave() {
        this.context.beginPath();
        this.context.lineWidth = 2;
        this.context.strokeStyle = palette.pink;
        for (let i = 0; i <= this.wavePoints.length; i ++) {
            const index = i % this.wavePoints.length;
            const amt = i / this.wavePoints.length;

            const x = this.width * amt;
            const y = this.wavePoints[index];

            if (i == 0) {
                this.context.moveTo(x, y);
            }
            else {
                this.context.lineTo(x, y);
            }
        }
        this.context.stroke();
    }
}
