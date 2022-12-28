import { isPointInRect, checkCorner, cursors } from '../../core/DrawingUtils';
import nj from 'numjs';
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
 * 
 * @param {*} origin 
 * @param {*} target 
 * @returns 
 */
function computeTransformation(origin, target) {
    // Computing the rotation
    let u = new Victor(origin.x, origin.y);
    let v = new Victor(target.x, target.y);

    // Computing the scale matrix
    let translate = nj.array([[1, 0], [0, 1], [target.x - origin.x, target.y - origin.y]]);
    let scale = nj.array([[target.x / origin.x, 0], [0, target.y / origin.y]]);

    return nj.dot(translate, scale);
}

/**
 * Tool - Class
 * @param {*} options 
 */
function Tool(options) {
    this.tool = null;
    this.active = true;
    const defaultOptions = {};

    this.options = Object.assign(defaultOptions, options);
}

Tool.prototype.disable = () => {
    throw new Error('Must be implemented by a subclass to be called.');
}

/**
 * 
 * SelectionTool - Class
 * @param {*} editor 
 */
function SelectionTool(editor, canvas) {
    Tool.call(this);

    var self = this;
    this.selectionDrawable
    this.pos = {x: 0, y: 0};
    this.isDragging;
    this.canvas = canvas;
    this.hit = -1;
    this.listeners = {};

    /**
     * 
     * @param {*} e 
     */
    const keyDown = (e) => {
        if(editor.keyboard.isDeleteKey(e)) {
            editor.deleteSelection();

            return;
        }
    }

    /**
     * 
     * @param {*} param0 
     */
    const mouseDown = ({x, y}) => {
        self.pos.x = x;
        self.pos.y = y;
        editor.select(x, y);
    };

    /**
     * 
     * @param {*} param0 
     */
    const mouseMove = ({x, y}) => {
        const pos = editor.pointToCanvas(x,  y);

        if(editor.selectionDrawable && !editor.mouse.isDragging) {
            this.hit = checkCorner(pos, editor.selectionDrawable.handleRadius * 2, editor.selectionDrawable.computeBounds());
            editor.setCursor(cursors(this.hit));
        }
    };

    const mouseUp = ({x, y}) => {
        // console.log('mouseUp', x, y)
    };

    const mouseDraggring = ({x, y}) => {
        // console.log('mouseDragging', x, y, self.pos.x, self.pos.y);
        if(!editor.selectionDrawable) return;

        const pos = editor.pointToCanvas(x,  y);
        const bounds = editor.selectionDrawable.computeBounds();
        let deltaX = editor.selectionDrawable._pos.x - pos.x;
        let deltaY = editor.selectionDrawable._pos.y - pos.y;
        let deltaX2;
        let deltaY2;

        const drawableCopy = JSON.parse(JSON.stringify(editor.selectionDrawable)); // Make a copy of the drawable in case we need it later for computation

        // Translatiion parameters
        let posX = 0;
        let posY = 0;

        // If the hit is -1, it means that no sensitive area was hit by the cursor.
        // In this case, it means that the user is either trying to move the selection or the cursor is outside of the selection.
        if(this.hit === -1) {
            editor.moveSelection(x - self.pos.x, y - self.pos.y, x, y)
            self.pos.x = x;
            self.pos.y = y;

            return;
        }

        switch(this.hit) {
            case 0: // Top-left
                editor.selectionDrawable._pos.x = pos.x;
                editor.selectionDrawable._pos.y = pos.y;
                editor.selectionDrawable.width += deltaX;
                editor.selectionDrawable.height += deltaY;
                break;
            case 1: // Top-right
                deltaX = pos.x - bounds.max.x;
                editor.selectionDrawable.width += deltaX;
                editor.selectionDrawable._pos.y = pos.y;
                editor.selectionDrawable.height += deltaY;
                break;
            case 2: // Bottom-left
                deltaY = pos.y - bounds.max.y;
                editor.selectionDrawable.height += deltaY;
                editor.selectionDrawable._pos.x = pos.x;
                editor.selectionDrawable.width += deltaX;
                break;
            case 3: // Bottom-right
                deltaX = pos.x - bounds.max.x;
                deltaY = pos.y - bounds.max.y;
                editor.selectionDrawable.width += deltaX;
                editor.selectionDrawable.height += deltaY;
                break;
            case 4: // Middle-top
                editor.selectionDrawable._pos.y = pos.y;
                editor.selectionDrawable.height += deltaY;
                break;
            case 5: // Middle-bottom
                deltaY = pos.y - bounds.max.y;
                editor.selectionDrawable.height += deltaY;
                break;
            case 6: // Middle-right
                deltaX = pos.x - bounds.max.x;
                editor.selectionDrawable.width += deltaX;
                break;
            case 7: // Middle-left
                editor.selectionDrawable._pos.x = pos.x;
                editor.selectionDrawable.width += deltaX;
                break;  
        }

        const t1 = computeTransformation(new Victor(drawableCopy._pos.x, drawableCopy._pos.y), new Victor(editor.selectionDrawable._pos.x, editor.selectionDrawable._pos.y));
        const t2 = computeTransformation(new Victor(drawableCopy._pos.x + drawableCopy.width, drawableCopy._pos.y + drawableCopy.height), new Victor(editor.selectionDrawable.width, editor.selectionDrawable.height));

        editor.resizeSelection(t1, t2);
    };

    this.disable = () => {
        editor.mouse.mouseDown.remove(this.listeners.mouseDownUUID);
        editor.mouse.mouseUp.remove(this.listeners.mouseUpUUID);
        editor.mouse.mouseMove.remove(this.listeners.mouseMoveUUID);
        editor.mouse.dragging.remove(this.listeners.mouseDraggingUUID);
        editor.keyboard.keyDown.remove(this.listeners.keyDownUUID);
    }

    this.enable = () => {
        this.listeners.mouseDownUUID = editor.mouse.mouseDown.add(mouseDown);
        this.listeners. mouseUpUUID = editor.mouse.mouseUp.add(mouseUp);
        this.listeners.mouseMoveUUID = editor.mouse.mouseMove.add(mouseMove)
        this.listeners.mouseDraggingUUID = editor.mouse.dragging.add(mouseDraggring);
        this.listeners.keyDownUUID = editor.keyboard.keyDown.add(keyDown);
    }

    // Enable all the listeners
    this.enable();
}

SelectionTool.prototype = Object.create(Tool.prototype);
SelectionTool.prototype.constructor = SelectionTool;

export { SelectionTool };