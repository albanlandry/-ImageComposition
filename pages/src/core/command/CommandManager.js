import * as Command from './Commands';

/**
 * 
 * @param {*} options 
 */
function CommandManager(options) {
    this.undoStack = [];
    this.redoStack = [];

    this.options = { ...{}, ...options };
    this.onCommandExecuted = this.options.onCommandExecuted || ((cmd) => { });
    this.onCommandFailed = this.options.onCommandFailed || ((cmd) => { });
    this.onRedoCleared = this.options.onRedoCleared || ((cmd) => { });
}

CommandManager.prototype = {
    executeCommand: function (cmd) {
        var self = this;

        if (!(cmd instanceof Command.ICommand))
            throw new Error('The command must be an instance of ICommand of subclasses')

        const promise = cmd.execute();
        this.undoStack.push(cmd);

        if (promise && promise.then) {
            promise.then((cmd) => {
                self.onCommandExecuted(cmd);
            })
                .catch((err) => {
                    self.onCommandFailed(err);
                });
        } else {
            self.onCommandExecuted(cmd);
        }

        this.clearRedo();
    },

    clearRedo: function () {
        const cmds = [...this.redoStack];
        this.redoStack = [];
        this.onRedoCleared(cmds);
    },

    clear: function () {
        this.redoStack.length = 0;
        this.undoStack.length = 0;
    },

    undo: function () {
        if (this.undoStack.length <= 0) {
            return;
        }

        const cmd = this.undoStack.pop();
        cmd.undo();
        this.redoStack.push(cmd)
    },

    undoUntil: function (uuid) {
        if (!this.hasUndo(uuid)) {
            return;
        }

        var cmd = this.undoStack[this.undoStack.length - 1];
        while (cmd.uuid !== uuid) {
            this.undo();

            cmd = this.undoStack[this.undoStack.length - 1];
        }
    },

    redo: function () {
        if (this.redoStack.length <= 0) {
            return;
        }

        const cmd = this.redoStack.pop();
        cmd.redo();
        this.undoStack.push(cmd);
    },

    redoUntil: function (uuid) {
        if (!this.hasRedo(uuid)) {
            return;
        }

        var cmd = this.redoStack[this.redoStack.length - 1];
        while (cmd.uuid !== uuid) {
            this.redo();

            cmd = this.redoStack[this.redoStack.length - 1];
        }

        this.redo();
    },

    hasRedo: function (uuid) {
        for (var i = 0; i < this.redoStack.length; i++) {
            if (this.redoStack[i].uuid === uuid) {
                return true;
            }
        }

        return false;
    },

    hasUndo: function (uuid) {
        for (var i = 0; i < this.undoStack.length; i++) {
            if (this.undoStack[i].uuid === uuid) {
                return true;
            }
        }

        return false;
    }
}

CommandManager.prototype.constructor = CommandManager;