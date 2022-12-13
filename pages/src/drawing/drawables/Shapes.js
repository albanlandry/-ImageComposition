import React, {useEffect, useState} from 'react';
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
    const [x, setX] = useState(props.x || 0);
    const [y, setY] = useState(props.y || 0);

    return null;
};

export { Rect, Image };