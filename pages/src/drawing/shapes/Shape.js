import Victor from 'Victor';
import { DocumentSnapshot, ImageSnapshot, ShapeSnapshot } from '../../core/store/Snapshot';

/**
 * Bound
 */
class Bound {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.min = {x: this.x, y: this.y};
        this.max = {x: this.x + this.width, y: this.y + this.height};
    }
}

/**
 * Shape
 */
class Shape {
    constructor(options) {
        this._pos = new Victor(options?.x || 0, options?.y || 0);
        this.width = options?.width || 0;
        this.height = options?.height || 0;
        this.bounds = new Bound();
        this.zIndex =options?.zIndex || 0;
        this.uuid = options?.uuid || 0;
    }

    get pos() { return this._pos; }

    set pos(value) { this._pos = value; }

    computeBounds() {
        this.bounds = {x: this._pos.x, y: this._pos.y, width: this.width, height: this.height};
        this.bounds.min = {x: this._pos.x, y: this._pos.y};
        this.bounds.max = {x: this._pos.x + this.width, y: this._pos.y + this.height};
        return this.bounds;
    }

    /**
     * 
     * @param {*} context 
     */
    draw(context) {
        throw new Error('computeBounds must be implemented by the child.');
    }

    snapshot(canvas) {
        this.computeBounds();

        const snapshot = new ShapeSnapshot(this);

        return snapshot;
    }
}

/**
 * Rect
 */
class Rect extends Shape {
    constructor(options) {
        super(options);

        this._pos = new Victor(options?.x || 0, options?.y || 0);
        this.width = options?.width || 0;
        this.height = options?.height || 0;
        this.fillStyle = options?.fillStyle || "#FF0964"
        this.computeBounds();
    }

    computeBounds() {
        this.bounds = {x: this._pos.x, y: this._pos.y, width: this.width, height: this.height};
        return this.bounds;
    }

    draw(context) {
        if(!context) return;

        context.save();

        context.beginPath();
        context.fillStyle = this.fillStyle;
        context.rect(this._pos.x, this._pos.y, this.bounds.width, this.bounds.height);
        context.fill();
        context.closePath();

        context.restore();
    }
}

/**
 * 
 * Image
 */
class Image extends Shape {
    constructor(options) {        
        super(options);
        this.uri = options?.source?.uri || '';
        this.computeBounds();
    }

    /**
     * 
     * @param {*} context 
     * @returns 
     */
    draw(context) {
        if(!context) return;
        
        // We draw the image for the first time if the image property is not set and the uri is specified.
        // Otherwise, we draw the image existing in memory.
        if(!this.image && this.uri.trim().length > 0) {
            const self = this;
            this.image = new window.Image();

            this.image.src = this.uri;
            this.image.onload = (e) => {
                self.width = self.image.width;
                self.height = self.image.height;
                self.computeBounds();
                // Calling the draw function of the component
                this.drawImage(context);
            };
        } else if(this.image) {
            this.drawImage(context);
        }
    }

    /**
     * 
     * @param {*} context 
     */
    drawImage(context) {
        if(!context) return;

        context.save();
        context.drawImage(this.image, this._pos.x, this._pos.y, this.width, this.height);
        context.restore();
    }
}

/**
 * SelectionRect
 */
class SelectionRect extends Shape {
    constructor(options) {
        super(options);

        this.computeBounds();
        this.handleRadius = 4;
    }

    /**
     * Draws the circle of the selection shape
     * @param {*} context 
     * @param {*} x 
     * @param {*} y 
     * @param {*} radius 
     * @param {*} startAngle 
     * @param {*} endAngle 
     * @param {*} isClockwise 
     */
    drawHandle(context, x, y, radius, startAngle, endAngle, isClockwise) {
        context.beginPath();
        context.fillStyle = "#FFFFFF";
        context.strokeStyle = "rgba(0,0, 0, 1)"
        context.lineWidth = 0.5
        context.arc(x, y, radius, startAngle, endAngle, isClockwise);
        context.fill();
        // context.stroke();
    }

    /**
     * 
     * @param {*} context 
     * @returns 
     */
    draw(context) {
        if(!context) return;

        context.save();
        context.beginPath();
        context.lineWidth = 1;
        context.setLineDash([8, 4, 4]);
        context.strokeStyle = "rgba(0, 0, 0, 0.8)"
        context.rect(this._pos.x, this._pos.y, this.width, this.height);
        context.stroke();
        context.closePath();

        // Drawing Handles

        // Rotation handle
        // Straight line handle
        context.save();
        context.setLineDash([0]);
        context.beginPath();
        context.moveTo((this.pos.x + this.width/2) - (this.handleRadius / 2), this.pos.y - this.handleRadius * 5);
        context.lineTo((this.pos.x + this.width/2) - (this.handleRadius / 2), this.pos.y);
        context.stroke();
        context.restore();
        
        // Drawing the location handle
        this.drawHandle(context, (this.pos.x + this.width/2) - (this.handleRadius / 2), this.pos.y - this.handleRadius * 5, this.handleRadius, 0, 2 * Math.PI, false);
        
        // Top-left handle
        this.drawHandle(context, this.pos.x, this.pos.y, this.handleRadius, 0, 2 * Math.PI, false);

        // Middle-top handle
        this.drawHandle(context, (this.pos.x + this.width/2) - (this.handleRadius / 2), this.pos.y, this.handleRadius, 0, 2 * Math.PI, false);

        // Top-right handle
        this.drawHandle(context, this.pos.x + this.width, this.pos.y, this.handleRadius, 0, 2 * Math.PI, false);

        // Bottom-left handle
        this.drawHandle(context, this.pos.x, this.pos.y + this.height, this.handleRadius, 0, 2 * Math.PI, false);

        // Middle-bottom handle
        this.drawHandle(context, (this.pos.x + this.width/2) - (this.handleRadius / 2), this.pos.y + this.height, this.handleRadius, 0, 2 * Math.PI, false);

        // bottom-right handle
        this.drawHandle(context, this.pos.x + this.width, this.pos.y + this.height, this.handleRadius, 0, 2 * Math.PI, false);

        // Middle-left handle
        this.drawHandle(context, this.pos.x, this.pos.y + this.height/2, this.handleRadius, 0, 2 * Math.PI, false);

        // Middle-right handle
        this.drawHandle(context, this.pos.x + this.width, this.pos.y + this.height/2, this.handleRadius, 0, 2 * Math.PI, false);

        context.restore();
    }
}

export { Rect, Image, SelectionRect };