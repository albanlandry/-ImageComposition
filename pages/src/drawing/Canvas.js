import React, {useEffect, useRef, useState} from "react";
import Victor from 'victor';
import PropTypes from 'prop-types';
import ShapeCreator from './shapes/ShapeCreator';
import Scene from '../core/Drawing';
import * as Tools from './tools/Tools';
// import { Stage, Layer, Star, Text } from 'react-konva';


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
    const isDragging = useRef(false);
    const [scene, setScene] = useState(new Scene());

    useEffect(() => {
        const cvs = canvasRef.current;
        // console.log(props.children[1].type.name, props.children[1].props);
        // Add the context property to each child component.
        // Since the react components are sealed object, we cannot directly edit their properties.
        // Thus, we need to clone the object with the additional property
        // const res = Array(props.children).flat().map((child, id) => {
        //     return React.cloneElement(child, {canvas: cvs, context: cvs.getContext('2d'), key: id});
        // });
        // setComponents(res)
        
        Array(props.children).flat()
            .filter(child => child.type.name.toLowerCase() !== 'draggable')
            .map(child => ShapeCreator.getShape(Object.assign({name: child.type.name}, child.props)))
            .forEach(child => scene.add(child));
        

        const render = () => {
            const context = cvs.getContext('2d');

            context.clearRect(0, 0, cvs.width, cvs.height);
            scene.children.forEach(child => child.draw(context));
            
            console.log(scene.children[0].pos.x);

            animationId.current = window.requestAnimationFrame(render);
        };

        render();

        return() => {
            window.cancelAnimationFrame(animationId.current);
        }
    }, [props.pointer])
    // Adding the canvas property to the children

    /**
     * 
     */
    useEffect(() => {
        const cvs = canvasRef.current;

        /**
         * 
         * @param {*} canvas 
         * @param {*} x 
         * @param {*} y 
         * @returns 
         */
        const windowToCanvas = (canvas, x, y) => {
            var bbox = canvas.getBoundingClientRect();

            isDragging.current = true;

            return { x: x - bbox.left * (canvas.width  / bbox.width),
                y: y - bbox.top  * (canvas.height / bbox.height)
            };
        };

        /**
         * 
         * @param {*} e 
         */
        const onMouseDownHandler = (e) => {
            e.preventDefault();

            const pos = windowToCanvas(cvs, e.clientX, e.clientY);

            console.log(scene.children[0]);

            scene.children[0].pos.x = pos.x;
            scene.children[0].pos.y = pos.y;

            if(props.onMouseDown) props.onMouseDown(windowToCanvas(cvs, e.clientX, e.clientY));

            isDragging.current = true;
        }

        /**
         * 
         * @param {*} e 
         */
        const onMouseUpHandler = (e) => {
            e.preventDefault();

            if(props.onMouseUp) props.onMouseUp(windowToCanvas(cvs, e.clientX, e.clientY));

            isDragging.current = false;
        }

        /**
         * 
         * @param {*} e 
         */
        const onMouseMoveHandler = (e) => {
            e.preventDefault();

            // console.log(e)

            if(isDragging.current && props.onMouseMoveHandler) {
                props.onMouseMoveHandler(windowToCanvas(cvs, e.clientX, e.clientY));
            }
        }

        // Adding the event listeners related to the mouse events
        window.addEventListener('mousedown', onMouseDownHandler)
        window.addEventListener('mouseup', onMouseUpHandler)
        window.addEventListener('mousemove', onMouseMoveHandler)

        return () => {
            window.removeEventListener('mousedown', onMouseDownHandler);
            window.removeEventListener('mouseup', onMouseUpHandler);
            window.removeEventListener('mousemove', onMouseMoveHandler);
        }
    }, [])  

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