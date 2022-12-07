import React from 'react';

const Header = (props) => {
    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold text-right p-2">
            Header Menu
            </h1>
        </div>
    )
};

const SideMenu = (props) => {
    return (
        <div className="h-screen w-1/6 min-w-[180px]">
            <ul className="w-full">
                <li>1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
                <li>5</li>
            </ul>
        </div>
    )
}

/**
 * @param {*} props 
 */
const Template = (props) => {

    return (<div className="w-full mx-auto">
        <Header />
        <div className="w-full bodyContainer flex">
            <SideMenu />
            { props.mainArea ? props.mainArea: null }
        </div>
    </div>)
}

export default Template;