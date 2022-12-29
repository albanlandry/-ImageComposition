/**
 * 
 * Snapshot 
 */
class Snapshot {
    constructor() {
        this.payload = {};
        this.payload.date = Date.now();;
    }

    getName() {
        return this.constructor.name;
    }

    getSnapshotDate() {
        return this.payload.date;
    }

    toJson() {
        return this.payload;
    }
}

/**
 * 
 * Class ShapeSnapshot
 */
class ShapeSnapshot extends Snapshot {
    constructor(state) {
        super();

        this.payload.x = state.pos.x;
        this.payload.y = state.pos.y;
        this.payload.width = state.computeBounds().width;
        this.payload.height = state.computeBounds().height;
        this.payload.zIndex = state.zIndex;
        this.payload.uuid = state.uuid;
    }

    toJson() {
        return this.payload;
    }

    toString() {
        return JSON.stringify(this.payload);
    }
}

/**
 * 
 * Class ImageSnapshot
 */
class ImageSnapshot extends ShapeSnapshot {
    constructor(state) {
        super(state);

        this.payload.image = state.imageData;
    }
}

/**
 * Scene snapshot
 */
class SceneSnapshot extends Snapshot {
    constructor(scene) {
        super();

        this.payload.children = scene.children;
    }

    toString() {
        let str = this.payload.children.reduce((acc, child) => `${(acc)? `${acc},`: ''} ${child.snapshot().toString()}`, '');

        return `{"children":[${str}]}`.replaceAll('\r\n', '');
    }
}

/**
 * 
 * Class DocumentSnapshot
 */
class DocumentSnapshot extends Snapshot {
    constructor(state) {
        super();

        this.payload.dimensions = {width: state.canvas.width, height: state.canvas.height}
        this.payload.scene = state.scene;
    }

    toString()  {
        const scenesnap = new SceneSnapshot(this.payload.scene)

        return `{dimensions:${JSON.stringify(this.payload.dimensions)},"scene": ${scenesnap.toString()}}`.replaceAll('\r\n', '');
    }
    /*
    sceneSnapshot(scene) {
        scene.children.forEach(child => {
            if(!child.snapshot) throw new Error('No snapshot found');

            this.payload.scene.children.push(child.snapshot())
        });
    }*/
}

export {DocumentSnapshot, ImageSnapshot, ShapeSnapshot, SceneSnapshot};