import React, {useEffect, useRef, useState} from "react";
import PropTypes from 'prop-types';
import ShapeCreator from './shapes/ShapeCreator';
import Scene from '../core/Drawing';
import MouseDragger from "../core/event/MouseDragger";
import { isPointInRect } from "../core/DrawingUtils";
// import { Stage, Layer, Star, Text } from 'react-konva';


const CANVAS_DEFAULT_WIDTH = 300;
const CANVAS_DEFAULT_HEIGHT = 150;

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

const Editor = { 
    scene: new Scene(),
    selection: null, // The list of object selected by the mouse
    selectionDrawable: Object.assign({name: 'selection'}), 
    mouse: null,
    init: false,

    // functions related to the editor
    /**
     * 
     * @param {*} x 
     * @param {*} y 
     */
    select: (x, y) => {
        const selected = Editor.scene.children.filter(child => isPointInRect(child.computeBounds(), {x: x, y: y}));
        
        const minX =  Math.min(...selected.map(child => child.computeBounds().x));
        const minY =  Math.min(...selected.map(child => child.computeBounds().y));
        const width =  Math.max(...selected.map(child => child.computeBounds().width));
        const height =  Math.max(...selected.map(child => child.computeBounds().height));

        // console.log(minX, minY, width, height);

        if(!Editor.selection) {
            // Editor.selection = Editor.scene.
        }
    },

    /**
     * Free up space in memory.
     */
    free: () => {
        Editor.mouse.removeListeners();
    }
};

/**
 * 
 * @param {*} props 
 * @returns 
 */
const Canvas = (props) => {
    const canvasWidth = props.width || CANVAS_DEFAULT_WIDTH;
    const canvasHeight = props.height || CANVAS_DEFAULT_HEIGHT;
    const canvasRef = useRef(null);
    const animationId = useRef(null);

    useEffect(() => {
        const cvs = canvasRef.current;
        Editor.mouse = new MouseDragger();

        const render = () => {
            const context = cvs.getContext('2d');

            context.clearRect(0, 0, cvs.width, cvs.height);
            Editor.scene.children.forEach(child => child.draw(context));

            animationId.current = window.requestAnimationFrame(render);
        };

        // Filter and translate the canvas React children into drawble elements.
        // Flatten the children in case they are nested within each other, filter them to remove
        // those who are not drawble and convert the elements into drawable items.
        if(!Editor.init) {
            Array(props.children).flat()
            .filter(child => child.type.name.toLowerCase() !== 'draggable')
            .map(child => ShapeCreator.getShape(Object.assign({name: child.type.name}, child.props)))
            .forEach(child => Editor.scene.add(child));

            initializeInput();
            render();

            Editor.init = true;
        }

        return() => {
            window.cancelAnimationFrame(animationId.current);
        }
    }, [])
    // Adding the canvas property to the children

    const initializeInput = () => {
        Editor.mouse.mouseDown.add((e) => {
            const pos = windowToCanvas(canvasRef.current, e.x, e.y);
            Editor.select(pos.x, pos.y);
        });
    }

    return (
        <canvas
            className = "border border-solid border-black box-border shadow-[0px_0px_4px_rgba(0,0,0,1)]"
            ref={canvasRef} width={canvasWidth} height={canvasHeight}>
        </canvas>
    )
};

Canvas.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number
};

export default Canvas;