import { v4 as uuidv4 } from 'uuid';

function ICommand() {
    this.uuid = uuidv4();
}

ICommand.prototype = {
    execute: () => { },
    undo: () => { },
    redo: () => { },
}

ICommand.prototype.constructor = ICommand;