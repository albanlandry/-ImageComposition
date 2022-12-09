import React, {useRef} from 'react';
import Template from '../src/Template';
import Canvas, {testering} from '../src/drawing/Canvas';
import { Rect, Image }from '../src/drawing/drawables/Shapes';
import { shapes } from 'konva/lib/Shape';


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

const image_url = "https://media.istockphoto.com/id/1327824636/photo/cherry-blossom-in-spring-at-gyeongbokgung-palace.jpg?b=1&s=170667a&w=0&k=20&c=9u8hQ44fqCwShNu5JmZeNILPB0BHdgVOfRUKu4Ap6s4=";

const generate_rects = (count) => {    
    return Array(count).fill(0).map((_, i) => {
        const x = Math.random() * 400;
        const y = Math.random() * 600;
        const hh = Math.random() * 400;
        const ww = Math.random() * 600;
        const h = Math.random() * 359;
        const s = Math.random() * 100;
        const l = Math.random() * 100;
        const a = (Math.random() + 1) / 2;

        return <Rect
            key = {i}
            x ={x} 
            y = {y}
            width = {ww}
            height = {hh}
            fillStyle = {`hsla(${h}, ${s}%, ${l}%, ${a})`}
            />
    });
}

/**
 * 
 * @param {*} props 
 * @returns 
 */
const Viewport = (props) => {
    const shapes = generate_rects(20);

    return(
        <div className="p-5 w-full flex justify-center items-center overflow-auto">
            <Canvas width={600} height={400}>
                <Rect 
                    x = {0}
                    y = {0}
                    width={600}
                    height={400}               
                />
                <Image 
                    x = {0}
                    y = {0}
                    source = {{uri: image_url}}
                />
                <Image 
                    x = {50}
                    y = {50}
                    source = {{uri: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.asicentral.com%2Fmedia%2F20479%2Fscottcolumnfig4-800.jpg&f=1&nofb=1&ipt=fcab215c4898ef49595cc7b3c7174a30ac6c08462f75282194a637b9bb916518&ipo=images"}}
                />
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

const SideMenu = (props) => {
    const items = [
        {label: "images 1", thumbnail: "https://media.istockphoto.com/id/1327824636/photo/cherry-blossom-in-spring-at-gyeongbokgung-palace.jpg?b=1&s=170667a&w=0&k=20&c=9u8hQ44fqCwShNu5JmZeNILPB0BHdgVOfRUKu4Ap6s4="},
        {label: "images 2", thumbnail: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.asicentral.com%2Fmedia%2F20479%2Fscottcolumnfig4-800.jpg&f=1&nofb=1&ipt=fcab215c4898ef49595cc7b3c7174a30ac6c08462f75282194a637b9bb916518&ipo=images"}
    ]

    const children = items.map((item, index) => {
        return <li key={index} className="p-1 box-border odd:border-b odd:border-b-[#dfe6e9] hover:bg-[#b2bec3]/[0.9]">
            <Thumbnail src={item.thumbnail} label={item.label} />
        </li>
    })

    return (
        <ul>
            {children}
        </ul>
    )
};


/** THUMBNAIL COMPONENTS */
const THUMB_IMAGE_DEFAULT_SIZE = 90;

/**
 * 
 * @param {*} props 
 */
const Thumbnail = React.memo((props) => {
    const width = props.width || THUMB_IMAGE_DEFAULT_SIZE;
    const height = props.height || THUMB_IMAGE_DEFAULT_SIZE;

    return (
        <div className = "p-2 box-border align-middle pointer-events-none select-none">
            <div className={`align-middle border-2 w-[${width}px] h-[${height}px]`}>
                <img src = {props.src}/>
            </div>
            <span className="block px-2 text-sm">{props.label || ""}</span>
        </div>
    )
});

/**
 * 
 * @param {*} props 
 * @returns 
 */
export default function Editor (props) {
   return(
    <Template mainArea={<MainArea />} sideMenus={[<SideMenu />]} />
   )
}