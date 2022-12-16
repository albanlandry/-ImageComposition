import Victor from 'Victor';

class Bound {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
}

/**
 * 
 */
class Shape {
    constructor(options) {
        this._pos = new Victor();
        this.bounds = new Bound();
        this.zIndex =options?.index || 0;
    }

    get pos() { return this._pos; }

    set pos(value) { this._pos = value; }

    // get bounds() { return this.bounds; }

    computeBounds() {
        throw new Error('computeBounds must be implemented by the child.');
    }

    draw(context) {
        throw new Error('computeBounds must be implemented by the child.');
    }
}

/**
 * 
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

        // console.log("drawing", this._pos)
        context.beginPath();
        context.fillStyle = this.fillStyle;
        context.rect(this._pos.x, this._pos.y, this.bounds.width, this.bounds.height);
        context.fill();
        context.closePath();

        context.restore();
    }
}

class Image extends Shape {
    constructor(options) {        
        super(options);
        this.uri = options?.source?.uri || '';
    }

    /**
     * 
     * @returns 
     */
    computeBounds() {
        this.bounds = {x: this._pos.x, y: this._pos.y, width: this.image.width, height: this.image.height};
        return this.bounds;
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
        context.drawImage(this.image, this._pos.x, this._pos.y);
        context.restore();
    }
}

/**
 * SelectionRect
 */
class SelectionRect extends Shape {
    constructor(options) {
        super(options);

        this._pos = new Victor(options?.x || 0, options?.y || 0);
        this.width = options?.width || 0;
        this.height = options?.height || 0;
        this.computeBounds();
        this.handleRadius = 4;
    }

    computeBounds() {
        this.bounds = {x: this._pos.x, y: this._pos.y, width: this.width, height: this.height};
        return this.bounds;
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
        context.setLineDash([10, 6, 6]);
        context.strokeStyle = "rgba(0, 0, 0, 0.8)"
        context.rect(this._pos.x, this._pos.y, this.bounds.width, this.bounds.height);
        context.stroke();
        context.closePath();

        // Drawing Handles
        // Top-left handle
        this.drawHandle(context, this.pos.x, this.pos.y, this.handleRadius, 0, 2 * Math.PI, false);

        // middle-top handle
        this.drawHandle(context, (this.pos.x + this.bounds.width/2) - (this.handleRadius / 2), this.pos.y, this.handleRadius, 0, 2 * Math.PI, false);

        // Top-right handle
        this.drawHandle(context, this.pos.x + this.bounds.width, this.pos.y, this.handleRadius, 0, 2 * Math.PI, false);

        this.drawHandle(context, this.pos.x, this.pos.y + this.bounds.height, this.handleRadius, 0, 2 * Math.PI, false);

        // middle-bottom handle
        this.drawHandle(context, (this.pos.x + this.bounds.width/2) - (this.handleRadius / 2), this.pos.y + this.bounds.height, this.handleRadius, 0, 2 * Math.PI, false);

        // bottom-right handle
        this.drawHandle(context, this.pos.x + this.bounds.width, this.pos.y + this.bounds.height, this.handleRadius, 0, 2 * Math.PI, false);

        context.restore();
    }
}

export { Rect, Image, SelectionRect };