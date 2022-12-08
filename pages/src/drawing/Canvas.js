import React, {useEffect, useRef, useState} from "react";
import Victor from 'victor';
import PropTypes from 'prop-types';

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
    const [components, setComponents] = useState(null);
    const animationId = useRef(null);

    useEffect(() => {
        const cvs = canvasRef.current;

        // Add the context property to each child component.
        // Since the react components are sealed object, we cannot directly edit their properties.
        // Thus, we need to clone the object with the additional property
        const res = Array(props.children).flat().map((child, id) =>  React.cloneElement(child, {context: cvs.getContext('2d'), key: id}) );

        setComponents(res)

        const render = () => {
            

            animationId.current = window.requestAnimationFrame(render);
        };

        return() => {
            window.cancelAnimationFrame(animationId.current);
        }
    }, [])
    // Adding the canvas property to the children

    return (
        <canvas
            className = "border border-solid border-black box-border"
            ref={canvasRef} width={canvasWidth} height={canvasHeight}>
            {components}
        </canvas>
    )
};

Canvas.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number
};

export default Canvas;