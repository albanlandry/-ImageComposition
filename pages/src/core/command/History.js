function History(options) {
    this.options = {...{}, ...options};
    this.children = [];

    this.onUpdate = this.options.onChild ?? (() => {})
}

History.prototype.constructor = History;
History.prototype.add = function(elem) {
    this.children.push(elem);
    this.onUpdate({...this});
}

History.prototype.remove = function(uuid) {
    this.children = this.children.filter( (elem, index) => elem.uuid !== uuid );
};

History.prototype.clearFrom = function(offset) {
    if(offset >= this.children.length )
        throw new Error(`OutOfBoundError: ${offset}`);
    
    this.children = this.children.splice(0, offset + 1);
    this.onUpdate({...this});
}

History.prototype.clear = function(){
    this.children = [];
};

export default History;