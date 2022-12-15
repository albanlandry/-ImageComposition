import ShapeCreator from './shapes/ShapeCreator';
import {SelectionRect} from './shapes/Shape';
import Scene from '../core/Drawing';
import { isPointInRect } from "../core/DrawingUtils";
import Victor from 'victor';

/**
 * 
 * @param {*} canvas 
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
 const windowToCanvas = (canvas, x, y) => {
    var bbox = canvas.getBoundingClientRect();

    return { x: x - bbox.left * (canvas.width  / bbox.width),
        y: y - bbox.top  * (canvas.height / bbox.height)
    };
};

/**
 * Moves the points accoring to the position of the mouse pointer on the element
 * @param {*} mouseX 
 * @param {*} mouseY 
 * @param {Shape} drawable
 * @returns 
 */

class SceneEditor {
    constructor(options) {
        this.scene = new Scene(),
        this.selection = [], // The list of object selected by the mouse
        this.selectionDrawable = null,
        this.selectionDrawableUUID = null,
        this.mouse = null,
        this.init = false,
        this.tool = null,
        this.canvas = null;

        // functions related to the editor
        /**
         *
         * @param {*} x
         * @param {*} y
         */
        this.select = (x, y) => {
            const canvasOffset = windowToCanvas(this.canvas, x, y);
            const selected = Editor.scene.children.filter(child => isPointInRect(child.computeBounds(), { x: canvasOffset.x, y: canvasOffset.y }) && !(child instanceof SelectionRect));

            const minX = Math.min(...selected.map(child => child.computeBounds().x));
            const minY = Math.min(...selected.map(child => child.computeBounds().y));
            const width = Math.max(...selected.map(child => child.computeBounds().width));
            const height = Math.max(...selected.map(child => child.computeBounds().height));

            if (this.selection) {
                // this.scene.remove(this.selectionDrawableUUID);
                this.selectionDrawableUUID = null;
                this.selection = [];
            }

            if (selected.length > 0) {
                this.selectionDrawable = ShapeCreator.getShape({ name: 'selection', x: minX, y: minY, width: width, height: height });
                // this.selectionDrawableUUID = this.scene.add(this.selectionDrawable);
                this.selection = selected;

                // Compute the distance between the rectangle's top-left
                // corner and the cursor position.
                this.selectionDrawable.deltaX =  canvasOffset.x - minX;
                this.selectionDrawable.deltaY =  canvasOffset.y - minY;
            }

            // render after each operation
            this.render();
        },

        this.moveSelection = (xOffest, yOffset, windowX, windowY) => {
            const canvasOffset = windowToCanvas(this.canvas, windowX, windowY);

            var self = this;
            this.selection.forEach(elem => {
                let sel = self.scene.get(elem.uuid);

                if(sel) {
                    sel._pos = new Victor(canvasOffset.x - this.selectionDrawable.deltaX, canvasOffset.y - this.selectionDrawable.deltaY);
                }
            })

            // render after each operation
            this.select(windowX, windowY);
            this.render();
        },

        /**
         * Free up space in memory.
         */
        this.free = () => {
            Editor.mouse.removeListeners();
        };
    }

    setTool(tool) {
        if(this.tool) this.tool.disable();

        this.tool = tool;
    }

    render() {
        const context = this.canvas.getContext('2d');

        // Clear the background in order to remove all existing elements.
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid(context, 'lightgray', 10, 10);
        Editor.scene.children.forEach(child => child.draw(context));

        if(this.selectionDrawable) {
            this.selectionDrawable.draw(context);
        }
        // animationId.current = window.requestAnimationFrame(render);
    }

    drawGrid(context, color, stepx, stepy) {
        context.save();

        context.strokeStyle = color;
        context.lineWidth = 0.5;

        for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
           context.beginPath();
           context.moveTo(i, 0);
           context.lineTo(i, context.canvas.height);
           context.stroke();
        }

        for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
           context.beginPath();
           context.moveTo(0, i);
           context.lineTo(context.canvas.width, i);
           context.stroke();
        }

        context.restore();
    }
};

const Editor = new SceneEditor();

export default Editor;