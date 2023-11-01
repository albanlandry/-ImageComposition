import React, { useEffect, useReducer, useRef, useState } from 'react';
import Template from '../src/Template';
import Canvas from '../src/drawing/Canvas';
import { Rect, Image }from '../src/drawing/drawables/Shapes';
import { v4 as uuidv4 } from 'uuid';
import { windowToCanvas } from '../src/drawing/CanvasUtils';
import { isPointInRect } from '../src/core/DrawingUtils';
import axios from 'axios';
import { getDatatransferFiles, readFile, readImage } from '../src/Utils';
import Modal from 'react-modal';
import { ModalNewComposition } from '../src/ui/Modal';


/**
 * Returns a list of possible values for the url dynamic parameter
 * @param {*} param 
 */
export async function getStaticPaths() {
    let missions = [];
    const config = {
        url: `http://localhost:3000/api/missions`,
        method: 'GET',
    }

    try {
        const response = await axios.request(config);
        missions = response.data;   
    } catch (error) {
        console.log(err);
    }

    // Return a list of possible value for id
    return {
        paths: missions.map(mission => { 
            return {params: {id: `${mission.id}`}};
        }),
        fallback : false,
    };
}

/**
 * Exports data to be used inside the the subsequently generated page
 * @param {*} param 
 */
export async function getStaticProps({ params }) {
    let mission = null;
    const config = {
        url: `http://localhost:3000/api/missions/${params.id}`,
        method: 'GET',
    }

    try { 
        const response = await axios.request(config);
        if(response.data.length > 0) {
            mission = response.data.shift();
        };
    } catch(err) {
        console.log('Failed to fetch data');
    }

    return {
      props: {
        mission: mission,
      },
    };
}

// Modal
Modal.setAppElement('#main-container');
Modal.defaultStyles.overlay.zIndex = 2;

/**
 * 
 * @param {*} missionId 
 * @param {*} paramName 
 * @returns 
 */
const useMissionParam = (missionId, paramName) => {
    const [data, setData] = useState([])

    useEffect(() => {
        const fetchData = async() => {
            const config = {
                url: `http://localhost:3000/api/missions/infos?mId=${missionId}&p=${paramName}`,
                method: 'GET',
            }

            console.log(`http://localhost:3000/api/missions/infos?mId=${missionId}&p=${paramName}`,);

            try {
                const response = await axios.request(config);

                setData(response.data);
            } catch (error) {
                console.log({err: error.message})
            }
        }

        fetchData();
    }, [missionId, paramName])

    return data;
}

/**
 * 
 */
const Button = React.memo((props) => {
    const bgColor = props.bgColor || "#000000";

    return(
        <a href="#" className={`btn-default bg-[#0984e3] hover:bg-[#0984e3]/[0.9] active:ring-2 mt-5`}
        onClick={(e) => {
            e.preventDefault();

            props?.onButtonClick();
        }}>Create new foreground</a>
    )
});

/**
 * 
 */
const DefaultHomeArea = React.memo((props) => {
    const dispatch = props.dispatch || (() => {})
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
                    <Button bgColor="#0984e3" onButtonClick={(e) => {dispatch({type: DISPATCH_ACTIONS.SET_CMP_MODAL, value: true})}} />
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
    const [dimens, setDimens] = useState([props.width || 700, props.height || 525]);
    const canvasRef = useRef(null);

    /**
     * 
     * @param {*} e 
     */
    const onDrop= async (e) =>{
        e.preventDefault();

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

    /**
     * 
     * @param {*} e 
     * @param {*} url 
     */
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
            <div className="bg-slate-50" onDrop={onDrop} onDragEnter={onDragEnter} onDragOver={(e) => { e.preventDefault(); }}>
                <Canvas width={dimens[0]} height={dimens[1]} pointer={pos} onCanvasReady={onCanvasReady}>
                    {children}
                </Canvas>
            </div>
        </div>
    )
};

/* Data and states management ************************************************************************/
const initialComposition = {
    openNewCompositionModal: null,
    linkDimensions: false, // To link the current dimensions been edited
    width: 0,
    height: 0
};

const DISPATCH_ACTIONS = {
    SET_CMP_MODAL: 'set-cmp-modal',
    SET_LINK_DIMENS: 'set-link-dimens',
    SET_SIZE: 'set-size',
    SET_SIZE_WIDTH: 'set-size-width',
    SET_SIZE_HEIGHT: 'set-size-height',
};

/**
 * 
 * @param {*} state 
 * @param {*} action 
 * @returns 
 */
function reducer(state, action) {
    switch (action.type) {
        case DISPATCH_ACTIONS.SET_CMP_MODAL:
            return {...state, openNewCompositionModal: action.value};
        case DISPATCH_ACTIONS.SET_SIZE:
            let w = state.width, h = state.height;

            try {
                w = action.value[0];
                h = action.value[1];
            }catch(err) {
                alert(err.message);
                return {...state};
            }    

            return {...state, ...{width: w, height: h}};
        case DISPATCH_ACTIONS.SET_SIZE_WIDTH:
            return {...state, ...{width: action.value}};
        case DISPATCH_ACTIONS.SET_SIZE_HEIGHT:
            return {...state, ...{height: action.value}};
        case DISPATCH_ACTIONS.SET_LINK_DIMENS:
            return {...state, ...{linkDimensions: action.value}};
        default:
            throw new Error('UNDEFINED Action type');
    }
}

/**
 * 
 * @param {*} props 
 * @returns 
 */
const MainArea = function (props) {
    const [state, dispatch] = useReducer(reducer, initialComposition);
    const scene = props.scene || [];

    /**
     * 
     * @param {*} e 
     */
    const handleOnUserFileDropped = (e) => {
        if(props.onViewportFileDropped) props.onViewportFileDropped(e);
    }

    /**
     * 
     * @param {*} values 
     */
    const handleMNCSubmit = (values) => {
        console.log('Values', values);
        dispatch({type: DISPATCH_ACTIONS.SET_CMP_MODAL, value: false});
        dispatch({type: DISPATCH_ACTIONS.SET_SIZE, value: [values.width || 0, values.height || 0]});
    };

    return(
        // <div className="w-5/6 h-full bg-[#dfe6e9]">
        // btn-default bg-[#0984e3] hover:bg-[#0984e3]/[0.9] active:ring-2
        <>
            <div className="w-full h-full bg-[#dfe6e9]">
                { (scene.length > 0 || (state.width > 0 && state.height > 0)) 
                ? <Viewport dispatch={dispatch} onUserFileDropped={handleOnUserFileDropped}
                    width={state.width}
                    height={state.height}
                    /> 
                : <DefaultHomeArea dispatch={dispatch} /> }
                {/* <Viewport onUserFileDropped={handleOnUserFileDropped} /> */}
            </div>
            <ModalNewComposition 
                onSubmit={handleMNCSubmit}
                open={state.openNewCompositionModal} 
                data={{width: state.width, height: state.height}} 
                onRequestClose={(e) => dispatch({type: DISPATCH_ACTIONS.SET_CMP_MODAL, value: false}) }
                />
        </>
    )
};

/**
 * 
 * @param {*} props 
 * @returns 
 */
const SideMenu = (props) => {
    const items = props.items;
    const [selected, setSelection] = useState(null);

    /**
     * 
     * @param {*} e 
     */
    const onDragStart = (index, e) => {
        // Select the element at the given index.
        setSelection(index);

        // Editing the style of the selected element.
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
    }

    /**
     * 
     * @param {*} index 
     * @param {*} e 
     */
    const onItemClick = (index, e) => {
        console.log(`index: ${index}, event: ${e}`);
        setSelection(index);
    }

    // Mapping children items
    const children = items.map((item, index) => {
        return <li key={index} className={`p-1 box-border h-fit hover:bg-[#b2bec3]/[0.9] inline-block m-auto ${index === selected? 'bg-[#b2bec3]/[0.9]' : ''}`}
            draggable={true}
            onDrag={onDrag}
            onDragStart={onDragStart.bind(this, index)}
            onDragEnd={onDragEnd}
            onClick={onItemClick.bind(this, index)}
            >
            <Thumbnail src={item.thumbnail} label={item.label} />
        </li>
    })

    return (
        <div className="max-h-full w-full overflow-y-auto flex-col">
            <div className="flex justify-center max-h-[500px]">
                <ul onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} className={(children.length > 0) ? "inline-grid grid-cols-2 lg:grid-cols-3 gap-0" : ""}>
                    <>
                    {(children.length <= 0) ?
                        <li className="h-[500px] w-full border-2 border-dashed border-cyan-400 flex justify-center items-center">
                            <span className="flex box-border p-2 text-center text-cyan-600 pointer-events-none">Drop your image(s) here or inside the canvas</span>
                        </li>
                    : children}
                    </>
                </ul>
            </div>
        </div>
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
        <div className = "p-1 box-border pointer-events-none select-none flex items-center">
            <div className={`items-center flex justify-center border w-[50px] h-[50px]`}>
                <img src = {props.src} className="h-full w-full object-contain"/>
            </div>
            {/*<span className="flex-2 px-2 text-sm">{props.label || ""}</span>*/}
        </div>
    )
});

/**
 * 
 * @param {*} props 
 * @returns 
 */
export default function Editor (props) {
    // console.log('Props => ', props.mission);
    // Data
    const mission = props.mission;
    const scene = useMissionParam(mission.id, 'scene');
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

    const onViewportFileDropped = (e) => {
        e.preventDefault();

        handleDroppedFile(e);
    }

    // UI elements
    const sideMenus = [<SideMenu items={items} key={0} onFileDropped={handleDroppedFile.bind(this)}/>];
    const mainArea = <MainArea scene={scene} onViewportFileDropped={onViewportFileDropped} />;

   return(
    <Template mainArea={mainArea} sideMenus={sideMenus} />
   )
}