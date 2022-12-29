import ShapeCreator from './shapes/ShapeCreator';
import {SelectionRect} from './shapes/Shape';
import Scene from '../core/Drawing';
import { isPointInRect } from "../core/DrawingUtils";
import Victor from 'victor';
import nj from 'numjs';
import { DocumentSnapshot } from '../core/store/Snapshot';

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
 * SceneEditor
 */
class SceneEditor {
    constructor(options) {
        this.scene = new Scene(),
        this.selection = [], // The list of object selected by the mouse
        this.selectionDrawable = null,
        this.selectionDrawableUUID = null,
        this.mouse = null,
        this.keyboard = null,
        this.init = false,
        this.tool = null,
        this.canvas = null;
        this.shouldSnap = false;
        this.grid = {x: 8, y: 8}

        // functions related to the editor
        /**
         *
         * @param {*} x
         * @param {*} y
         */
        this.select = (x, y) => {
            const canvasOffset = windowToCanvas(this.canvas, x, y);
            let selected = Editor.scene.children.filter(child => isPointInRect(child.computeBounds(), { x: canvasOffset.x, y: canvasOffset.y }) && !(child instanceof SelectionRect));

            this.selectionDrawableUUID = null;
            this.selectionDrawable = null;
            this.selection = [];

            /*
            if (this.selection) {
                // this.scene.remove(this.selectionDrawableUUID);
                this.selectionDrawableUUID = null;
                this.selection = [];
            }
            */

            if (selected.length > 0) {
                selected = [selected.sort((a, b) => { return b.zIndex - a.zIndex; })[0]] ;

                const minX = Math.min(...selected.map(child => child.computeBounds().x));
                const minY = Math.min(...selected.map(child => child.computeBounds().y));
                const width = Math.max(...selected.map(child => child.computeBounds().width));
                const height = Math.max(...selected.map(child => child.computeBounds().height));

                this.selectionDrawable = ShapeCreator.getShape({ name: 'selection', x: minX, y: minY, width: width, height: height });
                // this.selectionDrawableUUID = this.scene.add(this.selectionDrawable);
                this.selection = selected;

                this.snapshot();

                // Compute the distance between the rectangle's top-left
                // corner and the cursor position.
                this.selectionDrawable.deltaX =  canvasOffset.x - minX;
                this.selectionDrawable.deltaY =  canvasOffset.y - minY;
            }

            // render after each operation
            this.render();
        },

        /**
         * 
         * @param {*} xOffest 
         * @param {*} yOffset 
         * @param {*} windowX 
         * @param {*} windowY 
         */
        this.moveSelection = (xOffest, yOffset, windowX, windowY) => {
            let canvasOffset = windowToCanvas(this.canvas, windowX, windowY);
            let self = this;

            this.selection.forEach(elem => {
                let sel = self.scene.get(elem.uuid);

                if(sel) {
                    let newX = canvasOffset.x - this.selectionDrawable.deltaX, // The new x position of the selection coordinates system after translationo
                    newY = canvasOffset.y - this.selectionDrawable.deltaY, // The new y position of the selection coordinates system after translationo
                    tx = sel.pos.x - this.selectionDrawable.pos.x, // The x position in the coordinates with respect to the selection drawable as the origin, 
                    ty = sel.pos.y - this.selectionDrawable.pos.y; // The y position in the coordinates with respect to the selection drawable as the origin, 

                    if(this.shouldSnap) {
                        // console.log(newX, newY, this.snapToGrid(newX, newY, this.grid.x, this.grid.y));
                        const snap = this.snapToGrid(newX, newY, this.grid.x, this.grid.y);
                        newX = snap.x;
                        newY = snap.y;
                    }

                    // We translate the position of the selected element inside the new coordinates system.
                    sel._pos = new Victor(newX + tx, newY + ty);
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

    deleteSelection() {
        if(this.selection && this.selection.length > 0) {
            this.scene.removeChild(...this.selection);
            console.log('Delete selection', this.selection)
            console.log('Update selection drawable');
        }
        
        this.render();
    }

    /**
     * 
     * @param {*} tool 
     */
    setTool(tool) {
        if(this.tool) this.tool.disable();

        this.tool = tool;
    }

    render() {
        const context = this.canvas.getContext('2d');

        // Clear the background in order to remove all existing elements.
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid(context, 'lightgray', this.grid.x, this.grid.y);
        
        Editor.scene.children.forEach(child => child.draw(context));

        if(this.selectionDrawable) {
            this.selectionDrawable.draw(context);
        }
        // animationId.current = window.requestAnimationFrame(render);
    }

    /**
     * 
     * @param {*} context 
     * @param {*} color 
     * @param {*} stepx 
     * @param {*} stepy 
     */
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

    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    pointToCanvas(x, y) {
        return windowToCanvas(this.canvas, x, y);
    }

    /**
     * 
     * @param {*} cursor 
     */
    setCursor(cursor) {
        this.canvas.style.cursor = cursor;
    }

    /**
     * 
     * @param {*} oldDim 
     * @param {*} newDim 
     */
    resizeSelection(t1, t2) {
        if(this.selection && this.selection.length > 0) {
            const bounds = this.selection[0].computeBounds();
            const newPos1 = nj.dot(nj.array([[bounds.x, bounds.y]]), t1.T);
            const newPos2 = nj.dot(nj.array([[bounds.x + bounds.width, bounds.y + bounds.height]]), t2.T);
            this.selection[0]._pos.x = newPos1.get(0, 0);
            this.selection[0]._pos.y = newPos1.get(0, 1);
            this.selection[0].width = newPos2.get(0, 0);
            this.selection[0].height = newPos2.get(0, 1);
        }

        this.render();
    }

    /**
     * 
     */
    snapshot() {
        this.snap = new DocumentSnapshot(this);
        // this.snap.sceneSnapshot(this.scene);

        console.log(this.snap.toString());
    }

    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} snapX 
     * @param {*} snapY 
     * @returns 
     */
    snapToGrid(x, y, snapX, snapY) {
        const posX = Math.round(x / snapX) * snapX;
        const posY = Math.round(y / snapY) * snapY;
        
        return {x: posX, y: posY};
    }
};

const Editor = new SceneEditor();

export default Editor;