import React, {useRef} from "react";
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

    return (
        <canvas
            className = "border border-solid border-black"
            ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>
    )
};

Canvas.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number
};

export default Canvas;