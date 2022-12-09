import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

/**
 * 
 * @param {*} props 
 * @returns 
 */
const Movable = (props) => {
    const [components, setComponents] = useState(null);

    useEffect(() => {
        // Add the context property to each child component.
        // Since the react components are sealed object, we cannot directly edit their properties.
        // Thus, we need to clone the object with the additional property
        const res = Array(props.children).flat().map((child, id) => {
            return React.cloneElement(child, {context: props.context, key: id});
        });

        setComponents(res)
    }, [])
    // Adding the canvas property to the children

    return (<>{components}</>);
};

export { Movable }