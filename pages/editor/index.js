import React, {useState, useRef, useEffect} from 'react';
import Template from '../src/Template';
import Canvas from '../src/drawing/Canvas';
import { Rect, Image }from '../src/drawing/drawables/Shapes';
import { v4 as uuidv4 } from 'uuid';
import { windowToCanvas } from '../src/drawing/CanvasUtils';
import { isPointInRect } from '../src/core/DrawingUtils';

const Configs = {

};

/**
 * 
 * @param {*} file 
 * @returns 
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
            resolve(reader.result);
        }, false);

        reader.addEventListener('error', (err) => {
            reject(err);
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        } else {
            reject(new Error('NO FILE FOUND'));
        }
    })
}

/**
 * 
 * @param {*} url 
 * @returns 
 */
function readImage(url) {
    return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.onload = (e) => {
            resolve(image);
        }

        image.onerror = (e) => {
            reject(err)
        }

        image.src = url;
    })
}

/**
 * 
 * @param {*} ev 
 * @param {*} reg 
 * @returns 
 */
function getDatatransferFiles(ev, kind = 'file', reg) {
    let files = [];

    if(ev.dataTransfer.items) {
        files = [...ev.dataTransfer.items].filter((item) => item.kind === kind)
        .map((item) => item.getAsFile())
    } else {
        files = ev.dataTransfer.files;
    }

    const image_reg = reg || /^image\/(jpg|jpeg|png)$/i;
    // We make sure that the files received are images by checking the mime type of the file
    
    return files.filter((file) => file.type.trim().match(image_reg));
}

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
    const [pos, setPos] = useState({x: 0, y: 0});
    const [children, setChildren] = useState([]);
    const [dimens, setDimens] = useState([700, 525]);
    const canvasRef = useRef(null);

    /**
     * 
     * @param {*} e 
     */
    const onDrop= async (e) =>{
        e.preventDefault();
        // e.dataTransfer.setData("text/uri-list", items[index].thumbnail);
        // e.dataTransfer.setData("text/plain", items[index].thumbnail);
        let url = e.dataTransfer.getData("text/uri-list");

        if(!url) url = e.dataTransfer.getData("text/plain");

        // If there is no url found inside the data transfer, the drop element most like comes from the user operating storage.
        // In this case, we open the dropped files and add them to both the viewport and the side list.
        if(!url) {
            if(props.onUserFileDropped) props.onUserFileDropped(e);

            const files = getDatatransferFiles(e);
            await Promise.all(files.map(async (file) => {
                const res = await readFile(file);
                await addImageToViewport(e, res);
                
                return {label: file.name, thumbnail: res}
            }))

            setChildren([...children]);

            return;
        }

        e.dataTransfer.setData("text/uri-list", null);
        e.dataTransfer.setData("text/plain", null);
        
        await addImageToViewport(e, url);

        setChildren([...children]);
    };

    const addImageToViewport = async (e, url) => {
        const image = await readImage(url);
        const mouse = windowToCanvas(canvasRef.current, e.clientX, e.clientY);
        const pos = {x: mouse.x - image.width/2, y: mouse.y - image.height/2};
        children.push(                    
            <Image
                zIndex={children.length + 1}
                key={children.length}
                x = {pos.x}
                y = {pos.y}
                source = {{uri: url}}
                uuid={uuidv4()}
            />)
    }

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
                    {children}
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

    const handleOnUserFileDropped = (e) => {
        if(props.onViewportFileDropped) props.onViewportFileDropped(e);
    }

    return(
        <div className="w-5/6 h-full bg-[#dfe6e9]">
            { /* <DefaultHomeArea /> */ }
            <Viewport onUserFileDropped={handleOnUserFileDropped} />
        </div>
    )
};

/**
 * 
 * @param {*} props 
 * @returns 
 */
const SideMenu = (props) => {
    const items = props.items;

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
        console.log('onDragEnd...', e);
        // e.target.classList.remove("opacity-60");
        e.target.classList.remove("opacity-60");
        e.target.classList.remove("border-b-4");
        e.target.classList.remove("border-blue-400");
    };

    /**
     * 
     * @param {*} e 
     */
    const onDragOver = (e) => {
        e.preventDefault();

        if(e.target.localName === "ul") return;

        // Child element
        e.target.classList.add("opacity-40");
        e.target.classList.add("border-b-4");
        e.target.classList.add("border-blue-400");

        // Parent element
        e.target.parentNode.classList.add("border-2");
        e.target.parentNode.classList.add("border-dashed");
        e.target.parentNode.classList.add("border-cyan-400");
        // e.target.classList.add("bg-sky-200");
    }

    /**
     * 
     * @param {*} e 
     */
    const onDragLeave = (e) => {
        e.preventDefault();

        e.target.classList.remove("opacity-40");
        e.target.classList.remove("border-b-4");
        e.target.classList.remove("border-blue-400");

        if(isPointInRect(e.target.parentNode.getBoundingClientRect(), {x: e.clientX, y: e.clientY})) return;

        //Parent element
        e.target.parentNode.classList.remove("border-2");
        e.target.parentNode.classList.remove("border-dashed");
        e.target.parentNode.classList.remove("border-cyan-400");

        if(e.target.localName === "ul") {
            e.target.classList.remove("border-2");
            e.target.classList.remove("border-dashed");
            e.target.classList.remove("border-cyan-400");
        }
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

        //Parent element
        e.target.parentNode.classList.remove("border-2");
        e.target.parentNode.classList.remove("border-dashed");
        e.target.parentNode.classList.remove("border-cyan-400");

        if(e.target.localName === "ul") {
            e.target.classList.remove("border-2");
            e.target.classList.remove("border-dashed");
            e.target.classList.remove("border-cyan-400");
        }

        if(props.onFileDropped) props.onFileDropped(e);
        // handleDroppedFile(e);
    }

    /**
     * 
     * @param {*} e 
     */

    // Mapping children items
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
        <ul onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} className="max-h-full h-[500px] overflow-y-auto">
            <>
            {(children.length <= 0) ?
                <li className="h-full w-full border-2 border-dashed border-cyan-400 flex justify-center items-center">
                    <span className="flex box-border p-2 text-center text-cyan-600 pointer-events-none">Drop your image(s) here or inside the canvas</span>
                </li>
            : children}
            </>
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
            <div className={`items-center flex justify-center border w-[80px] h-[80px]`}>
                <img src = {props.src} className="h-full w-full object-contain"/>
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
    // Data
    const [items, setItems] = useState([]);

    // Events handlers
    const handleDroppedFile = async (ev) => {
        const files = getDatatransferFiles(ev);

        if(files.length > 0 && props.onFileAdded)
            props.onFileAdded(files)

        const result = await Promise.all(files.map(async (file) => {
            const res = await readFile(file);
            
            return {label: file.name, thumbnail: res}
        }))

        setItems(items.concat(result));
    }

    // UI elements
    const sideMenus = [<SideMenu items={items} key={0} onFileDropped={handleDroppedFile.bind(this)}/>];

    const onViewportFileDropped = (e) => {
        e.preventDefault();

        handleDroppedFile(e);
        // console.log(`onViewport file dropped`, e);
    }

   return(
    <Template mainArea={<MainArea onViewportFileDropped={onViewportFileDropped} />} sideMenus={sideMenus} />
   )
}