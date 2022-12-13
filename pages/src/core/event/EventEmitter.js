/* jslint esversion: 6*/
import {v4 as uuidv4} from 'uuid';

/**
 *
 * @param {*} uuid
 * @param {*} callback
 */
function EventHandler(uuid, callback) {
    this.uuid = uuid;
    this.callback = callback;
}

EventHandler.prototype.constructor = EventHandler;
/**
 *
 */
function EventEmitter() {
    this.handlers = [];
    this.active = true;
}

EventEmitter.prototype = {
    add: function(callback) {
        const uuid = uuidv4();
        this.handlers.push(new EventHandler(uuid, callback));

        return uuid;
    },

    emit: function(options) {
        if(this.active) {
            this.handlers.forEach((handler) =>{
                handler.callback(options);
            });
        }
    },

    remove: function(uuid) {
        this.handlers = this.handlers.filter( (elem, index) => elem.uuid !== uuid );
    }
};

EventEmitter.prototype.constructor = EventEmitter;

export default EventEmitter;