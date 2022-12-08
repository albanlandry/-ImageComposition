import Victor from 'Victor';

class Bound {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
}

/**
 * 
 */
class Shape {
    constructor() {
        this.pos = new Victor();
        this.bounds = new Bound();
    }

    computeBounds() {
        throw new Error('computeBounds must be implemented by the child.');
    }
}