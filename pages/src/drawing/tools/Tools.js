/* jslint esversion: 6*/
import * as Utils from '../../core/DrawingUtils.js';
import { Point, Rect, RectCrop } from '../../core/Drawing.js';
import Victor from 'victor';
// import { clamp } from 'ag-psd/dist/helpers';

const Toolbox = {
    POINT: "PointTool",
    ERASER: "Eraser"
};

function Tool(options) {
    this.tool = null;
    this.active = true;
    const defaultOptions = {};

    this.options = Object.assign(defaultOptions, options);
}

Tool.prototype = {
    beforeDrawing: (ctx, documentData) => { },
    draw: (ctx, documentData) => { },
    drawingContinue: (ctx, documentData) => { },
    drawingEnd: (ctx, documentData) => { },
    finalizeDrawing: () => { },
};

/**
 *
 * @param {*} options
 */
function PointTool(options) {
    this.tool = "PointTool";
    this.size = options.size ? options.size : 5;

    if (!options.events)
        return;

    this.draw = (ctx, options) => {
        const point = options.point;
        this.x = point.x;
        this.y = point.y;
        const context = ctx;

        context.beginPath();
        context.strokeStyle = point.color;
        // context.lineWidth = 3;
        context.arc(point.pos.x, point.pos.y, 5, 0, 2 * Math.PI, false);
        context.stroke();
    }

    const drawingStartedUUID = options.events.drawingStarted.add((data) => {

    });

    const drawingContinueUUID = options.events.drawingContinue.add((data) => {

    });

    const drawingEndedUUID = options.events.drawingEnded.add((data) => {

        options.events.addPointToCanvas.emit(data);

    });

    this.disable = function () {
        options.events.drawingStarted.remove(drawingStartedUUID);
        options.events.drawingContinue.remove(drawingContinueUUID);
        options.events.drawingEnded.remove(drawingEndedUUID);
    };
}

PointTool.prototype = Object.create(Tool.prototype);
PointTool.prototype.constructor = PointTool;

/**
 *
 * @param {*} options
 */
function ColorPickerTool(options) {
    this.tool = "ColorPickerTool";
    this.size = options.size ?? 5;
    this.canvas = options.canvas;
    this.color = { r: 0, g: 0, b: 0, a: 0 };

    if (!options.events)
        return;

    this.draw = (ctx, options) => {}

    const drawingStartedUUID = options.events.drawingStarted.add((data) => {

    });

    const drawingContinueUUID = options.events.drawingContinue.add((data) => {

    });

    const drawingEndedUUID = options.events.drawingEnded.add((data) => {
        this.pos = data.mouse;
        data.color = pick(this.pos, this.canvas.getContext('2d'));

        options.events.selectColor.emit(data);
    });

    this.disable = function () {
        options.events.drawingStarted.remove(drawingStartedUUID);
        options.events.drawingContinue.remove(drawingContinueUUID);
        options.events.drawingEnded.remove(drawingEndedUUID);
    };

    function pick(pos, ctx) {
        var x = pos.x;
        var y = pos.y;
        var pixel = ctx.getImageData(x, y, 1, 1);
        var data = pixel.data;

        const rgba = { r: data[0], g: data[1], b: data[2], a: data[3] / 255 };

        return rgba;
    }
}

ColorPickerTool.prototype = Object.create(Tool.prototype);
ColorPickerTool.prototype.constructor = ColorPickerTool;


/**
 * Implements an area eraser tool
 * @param {*} options
 */
function EraserTool(options) {
    this.startPos = { x: 0, y: 0 };
    this.currentPos = { x: 0, y: 0 };
    this.tool = "Eraser";
    this.didDrag = false;
    var prevRect = null;

    if (!options.events)
        return;

    const drawingStartedUUID = options.events.drawingStarted.add((data) => {
        this.startPos = data.mouse;
        this.didDrag = false;
    });

    const drawingContinueUUID = options.events.drawingContinue.add((data) => {
        if (prevRect)
            data.scene.remove(prevRect.uuid);

        this.didDrag = true;
        options.events.redrawCanvas.emit();

        this.currentPos = data.mouse;
        const offset = 1;

        // constrains the current position within the boundaries of the canvas
        const canvas = data.ctx.canvas;

        this.currentPos.x = clamp(this.currentPos.x, 1, canvas.width - offset);
        this.currentPos.y = clamp(this.currentPos.y, 1, canvas.height - offset);        
        const width = this.currentPos.x - this.startPos.x;
        const height = this.currentPos.y - this.startPos.y;

        const rect = new Rect({
            x: this.startPos.x,
            y: this.startPos.y,
            width: width,
            height: height
        });

        rect.isTemp = true;

        // if (Utils.isPointInRect(data.bounds, new Point(this.currentPos.x, this.currentPos.y))) {
            data.scene.add(rect);

            prevRect = rect;
        // }
    });

    const drawingEndedUUID = options.events.drawingEnded.add((data) => {
        if (this.didDrag) {
            this.finalizeDrawing(data);
        }

        this.startPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };

        if (prevRect) {
            data.scene.remove(prevRect.uuid);
            prevRect = null;
        }

    });

    this.finalizeDrawing = (data) => {

        if (options.events.toolFinalizeDrawing) {
            const start = this.startPos;
            const end = this.currentPos;
            const min = new Point(Math.min(start.x, end.x), Math.min(start.y, end.y));
            const max = new Point(Math.max(start.x, end.x), Math.max(start.y, end.y));
            const bounds = new Rect({
                x: min.x, y: min.y,
                width: max.x - min.x,
                height: max.y - min.y
            });

            options.events.toolFinalizeDrawing.emit(
                {
                    tool: this.tool,
                    rect: bounds
                });
        }
    };

    this.disable = function () {
        this.active = false;
        options.events.drawingStarted.remove(drawingStartedUUID);
        options.events.drawingContinue.remove(drawingContinueUUID);
        options.events.drawingEnded.remove(drawingEndedUUID);
        options.events.drawingEnded.remove(drawingEndedUUID);
    };
}

EraserTool.prototype = Object.create(Tool.prototype);
EraserTool.prototype.constructor = EraserTool;

/**
 * 
 * @param {*} options 
 */
function CropTool(options) {
    Tool.call(this);

    const self = this;
    this.options = { ...{}, ...options };

    this.handleSize = options.handleSize || 30;
    this.cropView = new RectCrop({
        ...{
            handleSize: self.handleSize,
            width: options.canvas.width,
            height: options.canvas.height,
        }, ...self.options
    });

    this.handleArea = 12;
    this.options.scene.add(this.cropView);
    this.pos = { x: this.options.x || 0, y: this.options.y || 0 };
    this.width = options.canvas.width || 0;
    this.height = options.canvas.height || 0;

    // initialize corners
    this.topLeft = this.pos;
    this.topRight = { ...this.pos, ...{ x: this.width } };
    this.bottomRight = { x: this.width, y: this.height };
    this.bottomLeft = { ...this.bottomRight, ...{ x: this.pos.x } };
    this.foundHit = false;
    this.hit = -1;

    this.isDrawing = false;

    if (!options.events)
        return;

    const mouseMoveUUID = options.events.mouseMove.add((data) => {
        if (!this.isDrawing) {
            this.hit = checkHitPoint(data, this);

            if (options.onCornerFound && this.hit !== -1) {
                this.options.onCornerFound(this.hit);
            }

            const isInBounds = Utils.isPointInRect(this.cropView, new Point(data.mouse.x, data.mouse.y))
            this.options.events.onCursorChanged.emit({ hit: this.hit, inBounds: isInBounds });
        }
    });

    const drawingStartedUUID = options.events.drawingStarted.add((data) => {
        // console.log("drawingStarted", data);
        this.start = new Victor(data.mouse.x, data.mouse.y);
        this.didDrag = false;
        this.isDrawing = true;
        this.hit = checkHitPoint(data, this);
    });

    const drawingContinueUUID = options.events.drawingContinue.add((data) => {
        const offset = new Victor(data.mouse.x, data.mouse.y).subtract(this.start);

        const viewConfig = {
            handleSize: this.handleSize,
            x: this.cropView.x,
            y: this.cropView.y,
            width: this.cropView.width,
            height: this.cropView.height,
        };

        switch (this.hit) {
            case 0: // top-left
                viewConfig.x = data.mouse.x;
                viewConfig.y = data.mouse.x;
                // viewConfig.width = options.canvas.width;
                // viewConfig.height = options.canvas.height;
                break;

            case 1: // top-right
                /*
                viewConfig.x = this.cropView.x;
                viewConfig.y = offset.y;
                viewConfig.width = options.canvas.width - offset.y;
                viewConfig.height = options.canvas.height;
                */
                break;

            case 2: // bottom-righ
                /*
                viewConfig.x = this.cropView.x;
                viewConfig.y = this.cropView.y;
                viewConfig.width = options.canvas.width + offset.x;
                viewConfig.height = options.canvas.height + offset.x;
                */
                break;

            case 3: // bottom-left
                /*
                viewConfig.x = data.mouse.x;
                viewConfig.y = this.cropView.y;
                viewConfig.width = options.canvas.width
                viewConfig.height = options.canvas.height - data.mouse.x;
                */
                break;
            default:
                const isInBounds = Utils.isPointInRect(this.cropView, new Point(data.mouse.x, data.mouse.y))

                if (isInBounds) {
                    viewConfig.x += offset.x
                    viewConfig.y += offset.y
                    viewConfig.width += offset.x
                    viewConfig.height += offset.y
                }
                break;

        }

        // Delete the current view and redraw a new one in place with the given coordinates
        this.options.scene.remove(this.cropView.uuid);

        this.cropView = new RectCrop(viewConfig);

        this.options.scene.add(this.cropView);
        this.start = data.mouse;
    });

    const drawingEndedUUID = options.events.drawingEnded.add((data) => {
        if (options.events.onCropArea) {
            options.events.onCropArea.emit(this.cropView);
        }

        this.isDrawing = false;
    });

    this.finalizeDrawing = (data) => {
    };

    this.disable = function () {
        this.active = false;
        options.events.drawingStarted.remove(drawingStartedUUID);
        options.events.drawingContinue.remove(drawingContinueUUID);
        options.events.drawingEnded.remove(drawingEndedUUID);
        options.events.mouseMove.remove(mouseMoveUUID);
        options.scene.remove(this.cropView.uuid);
    };

    function checkHitPoint(data, obj) {
        const midArea = obj.handleArea / 2;
        const topLeftBounds = { x: obj.topLeft.x - midArea, y: obj.topLeft.y - midArea, width: obj.topLeft.x + midArea, height: obj.topLeft.y + midArea };
        const topRightBounds = { x: obj.topRight.x - midArea, y: obj.topRight.y - midArea, width: obj.topRight.x + midArea, height: obj.topRight.y + midArea };
        const bottomRightBounds = { x: obj.bottomRight.x - midArea, y: obj.bottomRight.y - midArea, width: obj.bottomRight.x + midArea, height: obj.bottomRight.y + midArea };
        const bottomLefttBounds = { x: obj.bottomLeft.x - midArea, y: obj.bottomLeft.y - midArea, width: obj.bottomLeft.x + midArea, height: obj.bottomLeft.y + midArea };

        let hit = -1;
        if (Utils.isPointInRect(topLeftBounds, new Point(data.mouse.x, data.mouse.y)))
            hit = 0;

        if (Utils.isPointInRect(topRightBounds, new Point(data.mouse.x, data.mouse.y)))
            hit = 1;

        if (Utils.isPointInRect(bottomRightBounds, new Point(data.mouse.x, data.mouse.y)))
            hit = 2;

        if (Utils.isPointInRect(bottomLefttBounds, new Point(data.mouse.x, data.mouse.y)))
            hit = 3;

        return hit;
    }
}

CropTool.prototype = Object.create(Tool.prototype);
CropTool.prototype.constructor = CropTool;

/**
 *
 * @param {*} options
 */
function PanTool(options) {
    this.tool = "PanTool";

    if (!options.events)
        return;

    const drawingStartedUUID = options.events.drawingStarted.add((data) => {
        this.startPos = data.mouse;
    });

    const drawingContinueUUID = options.events.drawingContinue.add((data) => {
        const pan = {};
        pan.x = data.mouse.offsetX - this.startPos.offsetX;
        pan.y = data.mouse.offsetY - this.startPos.offsetY;

        options.events.panCanvas.emit(pan);
        this.startPos = data.mouse;
    });

    const drawingEndedUUID = options.events.drawingEnded.add((data) => {

    });

    this.disable = function () {
        options.events.drawingStarted.remove(drawingStartedUUID);
        options.events.drawingContinue.remove(drawingContinueUUID);
        options.events.drawingEnded.remove(drawingEndedUUID);
    };
}

PanTool.prototype = Object.create(Tool.prototype);
PanTool.prototype.constructor = PanTool;


export { Tool, EraserTool, PointTool, ColorPickerTool, PanTool, CropTool, Toolbox };