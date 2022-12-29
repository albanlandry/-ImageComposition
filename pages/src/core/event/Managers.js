import EventEmitter from "./EventEmitter";

/**
 * /finid the name of the current os
 * @returns 
 */
function os ()
{
    let os = navigator.userAgent;
    let finalOs="";
    if (os.search('Windows')!==-1){
        finalOs="Windows";
    }
    else if (os.search('Mac')!==-1){
        finalOs="MacOS";
    }
    else if (os.search('X11')!==-1 && !(os.search('Linux')!==-1)){
        finalOs="UNIX";
    }
    else if (os.search('Linux')!==-1 && os.search('X11')!==-1){
        finalOs="Linux"
    }
    
    return finalOs;
}


const Utils = {
    os: os,
}

/**
 * Handle events related to the mouse + other events from the canvas
 */
function MouseDragger() {
    var self = this;
    this.drawingStarted = new EventEmitter();
    this.dragging = new EventEmitter();
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

        if(self.isDragging) self.dragging.emit({x: e.clientX, y: e.clientY});
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

/**
 * Handle events related to the keyboard
 * @param {*} options 
 */
function KeyboardManager(options) {
    var self = this;
    this.keyDown = new EventEmitter();
    this.keyUp = new EventEmitter();

    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);

    /**
     * Handler for Key down 
     * @param {*} e 
     */
    function onKeyDown(e) {
        self.keyDown.emit(e);
    }

    /**
     * Key up handler
     * @param {*} e 
     */
    function onKeyUp(e) {
        self.keyUp.emit(e);
    }

    /**
     * 
     */
    this.removeListeners = () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
    }

    this.isDeleteKey = (e) => {
        const macDelete = Utils.os().toLocaleLowerCase().includes('mac') && (e.metaKey && (e.code.toLowerCase() === 'backspace' || e.keyCode === 8));
        const winDelete = Utils.os().toLocaleLowerCase().includes('windows') && (e.code.toLowerCase() === 'delete' || e.keyCode === 46)

        return macDelete || winDelete;
    }
}


export {KeyboardManager, MouseDragger};