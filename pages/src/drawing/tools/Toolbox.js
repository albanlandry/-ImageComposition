import { isPointInRect, checkCorner, cursors } from '../../core/DrawingUtils';
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

    const mouseDownUUID = editor.mouse.mouseDown.add(({x, y}) => {
        self.pos.x = x;
        self.pos.y = y;
        editor.select(x, y);
    });

    const mouseUpUUID = editor.mouse.mouseUp.add(({x, y}) => {
        // console.log('mouseUp', x, y)
    });

    const mouseMoveUUID = editor.mouse.mouseMove.add(({x, y}) => {
        const pos = editor.pointToCanvas(x,  y);

        if(editor.selectionDrawable && !editor.mouse.isDragging) {
            this.hit = checkCorner(pos, 20, editor.selectionDrawable.computeBounds());
            editor.setCursor(cursors(this.hit));
        }
    })

    const mouseDraggingUUID = editor.mouse.dragging.add(({x, y}) => {
        // console.log('mouseDragging', x, y, self.pos.x, self.pos.y);
        if(!editor.selectionDrawable) return;

        const pos = editor.pointToCanvas(x,  y);
        const bounds = editor.selectionDrawable.computeBounds();
        let deltaX = editor.selectionDrawable._pos.x - pos.x;
        let deltaY = editor.selectionDrawable._pos.y - pos.y;

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
            case -1:
                editor.moveSelection(x - self.pos.x, y - self.pos.y, x, y)
                self.pos.x = x;
                self.pos.y = y;
                break;   
        }

        editor.render();
    });

    this.disable = () => {
        editor.mouse.mouseDown.remove(mouseDownUUID);
        editor.mouse.mouseUp.remove(mouseUpUUID);
        editor.mouse.mouseMove.remove(mouseMoveUUID);
        editor.mouse.dragging.remove(mouseDraggingUUID);
    }
}

SelectionTool.prototype = Object.create(Tool.prototype);
SelectionTool.prototype.constructor = SelectionTool;

export { SelectionTool };