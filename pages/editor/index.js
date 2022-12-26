import React, {useState, useRef} from 'react';
import Template from '../src/Template';
import Canvas from '../src/drawing/Canvas';
import { Rect, Image }from '../src/drawing/drawables/Shapes';
import { v4 as uuidv4 } from 'uuid';
import { windowToCanvas } from '../src/drawing/CanvasUtils';

const Configs = {

};

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
    const [pos, setPos] = useState({x: 0, y: 0});
    const [children, setChildren] = useState([]);
    const [dimens, setDimens] = useState([700, 525]);
    const canvasRef = useRef(null);

    /**
     * 
     * @param {*} e 
     */
    function onMouseMoveHandler(e) {
        // console.log('onMouseMoveHandler', e)

        setPos({x: e.x, y: e.y})
    }

    /**
     * 
     * @param {*} e 
     */
    const onDrop= (e) =>{
        // e.dataTransfer.setData("text/uri-list", items[index].thumbnail);
        // e.dataTransfer.setData("text/plain", items[index].thumbnail);
        let url = e.dataTransfer.getData("text/uri-list");

        if(!url) url = e.dataTransfer.getData("text/plain");

        children.push(                    
            <Image
                zIndex={children.length + 1}
                key={children.length}
                x = {0}
                y = {0}
                source = {{uri: url}}
                uuid={uuidv4()}
            />)

        e.dataTransfer.setData("text/uri-list", null);
        e.dataTransfer.setData("text/plain", null);

        setChildren([...children]);
        console.log('onDrop...', url)
    };

    /**
     * 
     * @param {*} e 
     */
    const onDragEnter = (e) =>{
        console.log('onDragEnter...')
    };

    const onCanvasReady = (canvas) =>{
        canvasRef.current = canvas;
    }

    return(
        <div className="p-5 w-full h-full flex justify-center items-center overflow-auto">
            <div onDrop={onDrop} onDragEnter={onDragEnter} onDragOver={(e) => { e.preventDefault(); }}>
                <Canvas width={dimens[0]} height={dimens[1]} pointer={pos} onCanvasReady={onCanvasReady}>
                    {
                        children
                    /*
                    <Image 
                            x = {300}
                            y = {100}
                            source = {{uri: image_url}}
                        />
                    <Rect 
                        x = {200}
                        y = {200}
                        width={100}
                        height={100}
                        fillStyle = {"#4389aa"}               
                    />
                    <Rect 
                        x = {pos.x}
                        y = {pos.x}
                        width={200}
                        height={100}               
                    />
                    <Image 
                        x = {50}
                        y = {50}
                        source = {{uri: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.asicentral.com%2Fmedia%2F20479%2Fscottcolumnfig4-800.jpg&f=1&nofb=1&ipt=fcab215c4898ef49595cc7b3c7174a30ac6c08462f75282194a637b9bb916518&ipo=images"}}
                    />
                    */
                    }
                </Canvas>
            </div>
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
        <div className="w-5/6 h-full bg-[#dfe6e9]">
            { /* <DefaultHomeArea /> */ }
            <Viewport />
        </div>
    )
};

const SideMenu = (props) => {
    const items = [
        {label: "images 1", thumbnail: "https://media.istockphoto.com/id/1327824636/photo/cherry-blossom-in-spring-at-gyeongbokgung-palace.jpg?b=1&s=170667a&w=0&k=20&c=9u8hQ44fqCwShNu5JmZeNILPB0BHdgVOfRUKu4Ap6s4="},
        {label: "images 2", thumbnail: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.asicentral.com%2Fmedia%2F20479%2Fscottcolumnfig4-800.jpg&f=1&nofb=1&ipt=fcab215c4898ef49595cc7b3c7174a30ac6c08462f75282194a637b9bb916518&ipo=images"},
        {label: "images 3", thumbnail: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.aZ3vzsdzZcLc0brFCniaRgHaE8%26pid%3DApi&f=1&ipt=522e4e4751f59c87589e6fdf991c3b52bb642da9a8dc1d89286e00c07078d054&ipo=images"},
        {label: "images 5", thumbnail: "https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/6007/dog-clipart-md.png"},
        {label: "Falling snow", thumbnail: "https://pngimg.com/uploads/snow/snow_PNG27.png"},
        {label: "Sun Rays", thumbnail: "https://www.clipartmax.com/png/full/79-795646_art-clipart-transparent-background-sun-rays-clipart.png"},
    ]


    /**
     * 
     * @param {*} e 
     */
    const onDragStart = (index, e) => {
        console.log('onDragStart...');
        e.target.classList.add("opacity-60");

        // Data transfer
        e.dataTransfer.setData("text/uri-list", items[index].thumbnail);
        e.dataTransfer.setData("text/plain", items[index].thumbnail);
    };

    /**
     * 
     * @param {*} e 
     */
    const onDrag = (e) => {
        console.log('onDrag...');
    };

    /**
     * 
     * @param {*} e 
     */
    const onDragEnd = (e) => {
        console.log('onDragEnd...');
        // e.target.classList.remove("opacity-60");
    };

    /**
     * 
     * @param {*} e 
     */
    const onDragOver = (e) => {
        e.preventDefault();

        console.log(e.target);
        e.target.classList.add("opacity-40");
        e.target.classList.add("border-b-4");
        e.target.classList.add("border-blue-400");
        // e.target.classList.add("bg-sky-200");
    }

    /**
     * 
     * @param {*} e 
     */
    const onDragLeave = (e) => {
        e.target.classList.remove("opacity-40");
        e.target.classList.remove("border-b-4");
        e.target.classList.remove("border-blue-400");
        e.preventDefault();
    }

    /**
     * 
     * @param {*} e 
     */
    const onDrop = (e) => {
        e.preventDefault();
        e.target.classList.remove("opacity-40");
        e.target.classList.remove("border-b-4");
        e.target.classList.remove("border-blue-400");
        console.log('onDrop', e.target);
    }

    const children = items.map((item, index) => {
        return <li key={index} className="p-1 box-border border-b last:border-0 odd:border-b-[#dfe6e9] hover:bg-[#b2bec3]/[0.9]"
            draggable={true}
            onDrag={onDrag}
            onDragStart={onDragStart.bind(this, index)}
            onDragEnd={onDragEnd}
            >
            <Thumbnail src={item.thumbnail} label={item.label} />
        </li>
    })

    return (
        <ul onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} className="max-h-full overflow-y-auto">
            {children}
        </ul>
    )
};


/** THUMBNAIL COMPONENTS */
const THUMB_IMAGE_DEFAULT_SIZE = 80;

/**
 * 
 * @param {*} props 
 */
const Thumbnail = React.memo((props) => {
    const width = props.width || THUMB_IMAGE_DEFAULT_SIZE;
    const height = props.height || THUMB_IMAGE_DEFAULT_SIZE;

    return (
        <div className = "p-2 box-border pointer-events-none select-none flex items-center">
            <div className={`flex flex-1 items-center border w-[${width}px] h-[${height}px]`}>
                <img src = {props.src}/>
            </div>
            <span className="flex-2 px-2 text-sm">{props.label || ""}</span>
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
    <Template mainArea={<MainArea />} sideMenus={[<SideMenu key={0}/>]} />
   )
}