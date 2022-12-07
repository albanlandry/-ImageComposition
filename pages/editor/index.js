import React, {useRef} from 'react';
import Template from '../src/Template';
import Canvas, {testering} from '../src/drawing/Canvas';

/**
 * 
 */
const Button = React.memo((props) => {
    const bgColor = props.bgColor || "#000000";

    return(
        <a href="#" className={`btn-default bg-[${bgColor}] hover:bg-[${bgColor}]/[0.9] active:ring-2 mt-5`}>Create new foreground</a>
    )
});

/**
 * 
 */
const DefaultHomeArea = React.memo(() => {
    /**
     * 
     * @param {*} e 
     */
    const onDragOverHandler = (e) => {
        e.preventDefault(); // Prevent default behavior (Prevent file from being opened)
    };

    /**
     * 
     * @param {*} e 
     */
    const onDropHandler = (e) => {
        e.preventDefault();

        const event = e.nativeEvent;
        let files = [];

        // Retrieve only the list of files
        if(event.dataTransfer.items) {
            files = [...e.dataTransfer.items].filter((item) => item.kind === 'file')
            .map((item) => item.getAsFile())
        } else {
            files = event.dataTransfer.files;
        }

        const image_reg = /^image\/(jpg|jpeg|png)$/i;
        // We make sure that the files received are images by checking the mime type of the file
        files = files.filter((file) => file.type.trim().match(image_reg));

        console.log("Files", files);
    };

    return (
        <div className="p-5 w-full flex justify-center">
            <div id="dropArea" className="flex mx-auto w-full border-2 border-dashed border-[#0984e3] items-center flex-col py-5"
                onDragOver = {onDragOverHandler} onDrop = {onDropHandler}
            >
                <h2 className="text-center">You can drop your image here or click on the Button below to create a new foreground</h2>
                <div className="">
                    <Button bgColor="#0984e3" />
                </div>
            </div>
        </div>
    )
});

/**
 * 
 * @param {*} props 
 * @returns 
 */
const Viewport = (props) => {

    return(
        <div className="p-5 w-full flex justify-center items-center overflow-auto">
            <Canvas width={600} height={400}>
            </Canvas>
        </div>
    )
};

/**
 * 
 * @param {*} props 
 * @returns 
 */
const MainArea = function (props) {

    return(
        <div className="w-5/6 h-screen bg-[#dfe6e9]">
            { /* <DefaultHomeArea /> */ }
            <Viewport />
        </div>
    )
};

/**
 * 
 * @param {*} props 
 * @returns 
 */
export default function Editor (props) {
   return(
    <Template mainArea={<MainArea />} />
   )
}