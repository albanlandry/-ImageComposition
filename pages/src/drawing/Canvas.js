import React, {useEffect, useRef, useState} from "react";
import PropTypes from 'prop-types';
import ShapeCreator from './shapes/ShapeCreator';
import { MouseDragger } from "../core/event/Managers";
import Editor from './Editor';
import * as Toolbox from './tools/Toolbox';

const CANVAS_DEFAULT_WIDTH = 300;
const CANVAS_DEFAULT_HEIGHT = 150;

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
        Editor.setTool(new Toolbox.SelectionTool(Editor));
        Editor.canvas = cvs; // Setting the canvas for the editor

        /**
         * Render the canvas
         */
         const render = () => {
            const context = cvs.getContext('2d');

            context.clearRect(0, 0, cvs.width, cvs.height);
            Editor.scene.children.forEach(child => child.draw(context));

            animationId.current = window.requestAnimationFrame(render);
        };

        // Filter and translate the canvas React children into drawble elements.
        // Flatten the children in case they are nested within each other, filter them to remove
        // those who are not drawble and convert the elements into drawable items.
        
        if([props.children].flat().length > 0) {
            Array(props.children).flat()
            .filter(child => child?.type.name.toLowerCase() !== 'draggable')
            .map((child, index) => {
                if(!child.props.zIndex) child.props.zIndex = index + 1;

                return ShapeCreator.getShape(Object.assign({name: child?.type.name}, child?.props))
            })
            .forEach(child => Editor.scene.add(child));

            // Editor.init = true;
        }

        Editor.render();

        // Send the canvas to the user
        if(props.onCanvasReady) props.onCanvasReady(cvs);
        // Rendering the scene
        // render();

        return() => {
            window.cancelAnimationFrame(animationId.current);
        }
    }, [props.children])
    // Adding the canvas property to the children

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