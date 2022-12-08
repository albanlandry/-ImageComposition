import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

/**
 * 
 * @param {*} props 
 */
const Rect = (props) => {
    const x = props.x || 0;
    const y = props.y || 0;
    const width = props.width || 0;
    const height = props.height || 0;
    const fillStyle = props.fillStyle || '#FF0000';
    const ctx = props.context;

    // Drawing after the component is mounted
    useEffect(() => {
        /**
         * 
         * @param {*} context - The 2D context 
         */
        const draw = (context) => {
            if(!context) return;

            ctx.save();

            context.beginPath();
            context.fillStyle = fillStyle;
            context.rect(x, y, width, height);
            context.fill();

            context.restore();
        };

        // Calling the draw function of the component
        draw(ctx);
    })

    return null;
};

/**
 * 
 * @param {*} props 
 * @returns 
 */
const Image = (props) => {
    const uri = props.source.uri;
    const ctx = props.context;
    const x = props.x || 0;
    const y = props.y || 0;

    useEffect(() => {
        /**
         * 
         * @param {*} context - The 2D context 
         */
         const draw = (context) => {
            if(!context) return;

            ctx.save();
            context.drawImage(image, x, y);

            context.restore();
        };

        // The code starts here
        // create the image that will be displayed
        const image = new window.Image();
        image.src = uri;
        image.onload = (e) => {
            // Calling the draw function of the component
            draw(ctx);
        };

    }, [props.source])

    return <></>
};

export { Rect, Image };