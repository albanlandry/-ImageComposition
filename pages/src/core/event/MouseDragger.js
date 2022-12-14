import EventEmitter from "./EventEmitter";

/**
 * Handle events related to the mouse + other events from the canvas
 */
function MouseDragger() {
    var self = this;
    this.drawingStarted = new EventEmitter();
    this.drawingContinue = new EventEmitter();
    this.drawingEnded = new EventEmitter();
    // this.mouseLeave = new EventEmitter();
    // this.mouseEntered = new EventEmitter();
    this.mouseUp = new EventEmitter();
    this.mouseDown = new EventEmitter();
    this.mouseMove = new EventEmitter();

    // Controls whether the use is dragging or not.
    this.isDragging = false;

    /* Adding the event listeners related to the mouse events */
    window.addEventListener('mousedown', onMouseDownHandler)
    window.addEventListener('mouseup', onMouseUpHandler)
    window.addEventListener('mousemove', onMouseMoveHandler)

    /**
     * Mouse down handler
     * @param {*} e 
     */
    function onMouseDownHandler(e) {
        self.isDragging = true;
        self.mouseDown.emit({x: e.clientX, y: e.clientY});
    }

    /**
     * Mouse up handler
     * @param {*} e 
     */
    function onMouseUpHandler(e) {
        self.isDragging = false;

        self.mouseUp.emit({x: e.clientX, y: e.clientY});
    }

    /**
     * Mouse move handler
     * @param {*} e 
     */
    function onMouseMoveHandler(e) {
        self.mouseMove.emit({x: e.clientX, y: e.clientY});

        if(self.isDragging) self.drawingContinue.emit({x: e.clientX, y: e.clientY});
    }

    /**
     * 
     */
    this.removeListeners = () => {
        window.removeEventListener('mousedown', onMouseDownHandler)
        window.removeEventListener('mouseup', onMouseUpHandler)
        window.removeEventListener('mousemove', onMouseMoveHandler)
    }
}

export default MouseDragger;