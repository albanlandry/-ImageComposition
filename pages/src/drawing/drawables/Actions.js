import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';

/**
 * 
 * @param {*} props 
 * @returns 
 */
const MouseHandler = (props) => {
    // const [components, setComponents] = useState(null);
    const canvas = props.canvas;

    useEffect(() => {
        const onMouseDownHandler = (e) => {
            e.preventDefault();

            console.log('onMouseDownHandler');
        }

        const onMouseUpHandler = (e) => {
            e.preventDefault();

            console.log('onMouseUpHandler');
        }

        const onMouseMoveHandler = (e) => {
            e.preventDefault();

            console.log('onMouseMoveHandler');
        }
        // Add the context property to each child component.
        // Since the react components are sealed object, we cannot directly edit their properties.
        // Thus, we need to clone the object with the additional property
        /*
        let res;

        if(res) {
            res = Array(props.children).flat().map((child, id) => {
                return React.cloneElement(child, {context: props.context, key: id});
            });
        }

        setComponents(res)
        */

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


    // Adding the canvas property to the children
    return null;
};

/**
 * 
 * @param {*} props 
 * @returns 
 */
const Draggable = (props) => {
    // const [components, setComponents] = useState(null);
    const cvs = props.canvas;
    const isDragging = useRef(false);

    useEffect(() => {
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

            if(isDragging.current && props.onMouseMoveHandler) {
                props.onMouseMoveHandler(windowToCanvas(cvs, e.clientX, e.clientY));
                // console.log('onMouseMoveHandler', windowToCanvas(cvs, e.clientX, e.clientY));
            }
        }
        // Add the context property to each child component.
        // Since the react components are sealed object, we cannot directly edit their properties.
        // Thus, we need to clone the object with the additional property
        /*
        let res;

        if(res) {
            res = Array(props.children).flat().map((child, id) => {
                return React.cloneElement(child, {context: props.context, key: id});
            });
        }

        setComponents(res)
        */

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


    // Adding the canvas property to the children
    return null;
};

export { MouseHandler, Draggable }