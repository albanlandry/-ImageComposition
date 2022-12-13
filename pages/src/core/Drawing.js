/* jslint esversion: 6*/
import * as Utils from "./DrawingUtils.js";
import { v4 as uuidv4 } from 'uuid';
import { calculateAspectRatioFit } from './DrawingUtils.js';

function Shape() {
    this.isTemplate = false;
    this.isVisible = true;
    this.name = "";
}

/**
* Implement a rectangle boundary
* */
function Rect(newOptions) {
    Shape.call(this);

    var defaultOptions = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    var options = { ...defaultOptions, ...newOptions };
    this.options = options;
    this.x = this.options.x;
    this.y = this.options.y;
    this.pos = new Point(this.x, this.y); // {x: this.x, y: this.y};
    this.width = this.options.width;
    this.height = this.options.height;
    this.size = { width: this.options.width, height: this.options.height };
    this.base = { w: 0, h: 0 };
}

Rect.prototype = Object.create(Shape.prototype);
Rect.prototype.constructor = Rect;
Rect.prototype.draw = function (ctx) {
    /*
    const ratioX =  ctx.canvas.width / this.base.w ?? ctx.canvas.width;
    const ratioY =  ctx.canvas.height / this.base.h ?? ctx.canvas.height;
    */
    /*
        context.beginPath();
        context.strokeStyle = this.color;
        context.lineWidth = 1;
        context.arc(this.pos.x * ratioX, this.pos.y * ratioY, 3, 0, 2 * Math.PI, false);
        context.stroke();
        */
    ctx.save();
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.pos.x, this.pos.y, this.width, this.height);
    ctx.restore();
};

/**
 * 
 */
function RectCrop(options) {
    Rect.call(this, options);

    this.handleSize = this.options.handleSize || 30;
}


RectCrop.prototype = Object.create(Rect.prototype);
RectCrop.prototype.constructor = RectCrop;
RectCrop.prototype.draw = function (ctx) {
    ctx.save();
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.pos.x, this.pos.y, this.width, this.height);
    ctx.restore();

    // Handles settings and positions
    const handleLength = this.handleSize;
    this.topRight = { ...this.pos, ...{ x: this.width } };
    this.bottomLeft = { ...this.pos, ...{ y: this.height } };

    const cornerWidth = 10;
    ctx.save();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = cornerWidth;

    // handles top left handle
    ctx.beginPath();
    ctx.moveTo(this.pos.x - cornerWidth / 2, this.pos.y);
    ctx.lineTo(this.pos.x + handleLength, this.pos.y);
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(this.pos.x, this.pos.y + handleLength);
    ctx.stroke();

    // Top right handle
    ctx.beginPath();
    ctx.moveTo(this.topRight.x + cornerWidth / 2, this.topRight.y);
    ctx.lineTo(this.topRight.x - handleLength, this.topRight.y);
    ctx.moveTo(this.topRight.x, this.topRight.y);
    ctx.lineTo(this.topRight.x, this.topRight.y + handleLength);
    ctx.stroke();

    // Bottom left
    ctx.beginPath();
    ctx.moveTo(this.bottomLeft.x, this.bottomLeft.y);
    ctx.lineTo(this.bottomLeft.x, this.bottomLeft.y - handleLength);
    ctx.moveTo(this.bottomLeft.x - cornerWidth / 2, this.bottomLeft.y);
    ctx.lineTo(this.bottomLeft.x + handleLength, this.bottomLeft.y);
    ctx.stroke();

    // bottom right
    ctx.beginPath();
    ctx.moveTo(this.width, this.height);
    ctx.lineTo(this.width, this.height - handleLength);
    ctx.moveTo(this.width + cornerWidth / 2, this.height);
    ctx.lineTo(this.width - handleLength, this.height);
    ctx.stroke();
    ctx.restore();

    // Middle cross
    const lineWidth = 2;
    const lineBorder = 1;
    const centerX = (this.width - (lineWidth + lineBorder * 2)) / 2 + this.pos.x / 2;
    const centerY = (this.height - (lineWidth + lineBorder * 2)) / 2 + this.pos.y / 2;

    // Context settings
    ctx.save();
    ctx.fillStyle = "#FFFFFF";

    // draw the vertical line of the cross
    ctx.rect(centerX, this.pos.y, lineWidth, this.height);
    ctx.fill();
    ctx.stroke();

    // draw horizontal line of the cross
    ctx.rect(this.pos.x, centerY, this.width, lineWidth);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
};

/**
* Points
*/
function Point(px, py, color) {
    Shape.call(this);

    this.pos = { x: px, y: py };
    // this.local = {x: px, y: py};
    this.color = color || "#FF0000";
    this.x = px;
    this.y = py;
}

Point.prototype = Object.create(Shape.prototype);
Point.prototype.constructor = Point;
Point.prototype.dist = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
}

Point.prototype.draw = function (context, fill, m, transform) {
    // const pixelRation = 1;
    const ratioX = context.canvas.width / this.base.w;
    const ratioY = context.canvas.height / this.base.h;
    this.local = new Point(ratioX * this.pos.x, ratioY * this.pos.y);

    context.save()
    context.beginPath();
    context.strokeStyle = "#0AD5F4";
    context.fillStyle = this.color;

    context.arc(this.pos.x * ratioX, this.pos.y * ratioY, 4 * devicePixelRatio, 0, 2 * Math.PI, false);

    if (fill === true) {
        context.fill();
    } else {
        context.lineWidth = 2;
        context.fill();
        context.stroke();
    }

    context.closePath();
    context.restore();
}


/**
 * Used to display an image on the canvas
 * @param {*} options
 */
function ImageShape(options) {
    Shape.call(this);

    var self = this;
    var defaults = { x: 0, y: 0, image: null };
    options = { ...defaults, ...options };

    this.x = options.x;
    this.y = options.y;
    this.pos = new Point(this.x, this.y);
    this.name = options.name || "";

    this.image = options.image;
    this.isGrayscale = options.isGrayscale || false;

    function setWH() {
        self.width = self.image.width;
        self.width = self.image.height;
    }

    setWH();
}

ImageShape.prototype = Object.create(Shape.prototype);
ImageShape.prototype.constructor = ImageShape;
ImageShape.prototype.draw = function (ctx) {
    const canvas = ctx.canvas;
    const dimens = calculateAspectRatioFit(this.image.width * devicePixelRatio, this.image.height * devicePixelRatio, canvas.width, canvas.height);
    const pos = {
        x: (canvas.width - dimens.width) / 2,
        y: (canvas.height - dimens.height) / 2
    };

    ctx.save();
    ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height, pos.x, pos.y, dimens.width, dimens.height);
    ctx.restore();
};

/**
* Chain
* Just a simple list of points
* */
function Chain(points) {
    this.points = [];

    if (points) {
        this.points = points;
    }
}

Chain.prototype.constructor = Chain;
Chain.prototype = {
    addPoint: function (p) {
        this.points.push(p);
    },

    removeAt: function (pos) {
        this.points = this.points.filter((elem, index) => index !== pos);
    },

    removePointsIn: function (bounds) {
        this.points = this.points.filter((elem, index) => !Utils.isPointInRect(bounds, elem));
    },

    reset: function () {
        this.points = [];
    }
};

/**
 *
 */
function Scene() {
    this.children = [];
}

Scene.prototype.constructor = Scene;

Scene.prototype = {
    prepend: function (child, draw) {
        if (!child.uuid)
            child.uuid = uuidv4();

        if (draw) {
            child.draw = draw;
        }

        this.children.unshift(child);
        return child.uuid;
    },

    add: function (child, draw) {
        if (!child.uuid)
            child.uuid = uuidv4();

        if (draw) {
            child.draw = draw;
        }

        this.children.push(child);

        return child.uuid;
    },

    removeAt: function (pos) {
        this.children = this.children.filter((elem, index) => index !== pos);
    },

    remove: function (uuid) {
        this.children = this.children.filter((elem, index) => elem.uuid !== uuid);
    },

    removeIn: function (bounds) {
        const toRemove = this.children.filter((elem) => {
            if (elem.local) { // Local position is relative the the position of the point based on the canvas' relative size
                return Utils.isPointInRect(bounds, elem.local);
            }

            return Utils.isPointInRect(bounds, elem.pos);
        });

        this.children = this.children.filter((elem, index) => {

            if (elem.local) { // Local position is relative the the position of the point based on the canvas' relative size
                return !Utils.isPointInRect(bounds, elem.local);
            }

            return !Utils.isPointInRect(bounds, elem.pos);
        });

        return toRemove;
    },

    reset: function () {
        this.children = [];
    }
};

/**
 * Draw an image at a fit ratio
 * @param {CanvasContext2D} ctx 
 * @param {Image} image 
 */
function drawImageFit(ctx, image) {
    const canvas = ctx.canvas;
    const dimens = calculateAspectRatioFit(image.width * devicePixelRatio, image.height * devicePixelRatio, canvas.width, canvas.height);
    const pos = {
        x: (canvas.width - dimens.width) / 2,
        y: (canvas.height - dimens.height) / 2
    };

    ctx.save();
    ctx.drawImage(image, 0, 0, image.width, image.height, pos.x, pos.y, dimens.width, dimens.height);
    ctx.restore();
}

export default Scene;
export { Point, Chain, Rect, RectCrop, ImageShape, drawImageFit};