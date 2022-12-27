import React from 'react';

const Header = (props) => {
    return (
        <div className="w-full">
            {props.header || <h1 className="text-2xl font-bold text-right p-2">Header Menu</h1>
            }
        </div>
    )
};

const SideArea= (props) => {
    return (
        <div className="h-full w-1/6 min-w-[180px]">
            { props.children }
        </div>
    )
}

/**
 * @param {*} props 
 */
const Template = (props) => {

    return (<div className="absolute top-0 right-0 bottom-0 left-0 flex flex-col">
        <Header />
        <div className="w-full h-full bodyContainer flex">
            <SideArea>
                {props.sideMenus || null}
            </SideArea>
            { props.mainArea ? props.mainArea: null }
        </div>
    </div>)
}

export default Template;