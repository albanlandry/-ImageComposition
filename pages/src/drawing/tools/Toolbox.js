import Editor from "../Editor";

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

    const mouseDownUUID = editor.mouse.mouseDown.add(({x, y}) => {
        self.pos.x = x;
        self.pos.y = y;
        editor.select(x, y);
    });

    const mouseUpUUID = editor.mouse.mouseUp.add(({x, y}) => {
        // console.log('mouseUp', x, y)
    });

    const mouseDraggingUUID = editor.mouse.dragging.add(({x, y}) => {
        // console.log('mouseDragging', x, y, self.pos.x, self.pos.y);
        editor.moveSelection(x - self.pos.x, y - self.pos.y, x, y)
        self.pos.x = x;
        self.pos.y = y;
    });

    this.disable = () => {
        editor.mouse.mouseDown.remove(mouseDownUUID);
        editor.mouse.mouseUp.remove(mouseUpUUID);
        editor.mouse.dragging.remove(mouseDraggingUUID);
    }
}

SelectionTool.prototype = Object.create(Tool.prototype);
SelectionTool.prototype.constructor = SelectionTool;

export { SelectionTool };