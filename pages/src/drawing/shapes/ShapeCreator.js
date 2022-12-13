import * as Shapes from './Shape';

/**
 * 
 */
const ShapeCreator = {
    getShape: (options) => {
        if(options.name.toLowerCase() === 'rect') {
            return new Shapes.Rect(options)
        }

        if(options.name.toLowerCase() === 'image') {
            return new Shapes.Image(options)
        }
    }
};

export default ShapeCreator;