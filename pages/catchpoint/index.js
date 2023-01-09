import React, { useContext, useEffect, useRef, useReducer, useState } from 'react';
import ReactModal from 'react-modal';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Template from '../src/Template';
import {FaPlus} from 'react-icons/fa';
import {CiCircleRemove} from 'react-icons/ci';
import {BiX} from 'react-icons/bi';
import { callback, getDatatransferFiles, readFile, readImage } from '../src/Utils';
import axios , {isCancel, AxiosError} from 'axios';

const MIN_HEIGHT = 400;
const DISPATCH_REMOVE_FILE = 'remove-file';
const DISPATCH_ADD_FILES = 'add-file';
const DISPATCH_SET_COVER_IMAGE = 'set-cover-image';
const DISPATCH_UNSET_COVER_IMAGE = 'unset-cover-image';
const INPUT_IMAGES = 'images';
const INPUT_COVER = 'cover'
const HOST = 'http://localhost';


/** Data management reducer */
const initialState = {files: [], cover: [], errMessages: []};
const FileDispatch = React.createContext(null); // To forward the reducer to the deep children elements

/**
 * 
 * @param {*} state 
 * @param {*} action 
 * @returns 
 */
function reducer(state, action) {
    switch (action.type) {
        case DISPATCH_REMOVE_FILE:
            return {...state, ...{ files: state.files.filter((_, idx) => {return idx !== action.id })}};
        case DISPATCH_ADD_FILES:
            return {...state, ...{files: state.files.concat(action.files)}};
        case DISPATCH_SET_COVER_IMAGE:
            return {...state, ...{cover: [action.file]}};
        case DISPATCH_UNSET_COVER_IMAGE:
            return {...state, ...{cover: []}};
        default:
            throw new Error();
    }
}

/**
 * 
 * @param {*} props 
 */
export default function CatchpointForm(props) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const inputFileRef = useRef(null);

    const onFileDroppedHandler = (fs) => {
        dispatch({type: DISPATCH_ADD_FILES, files: fs});
    };

    /**
     * 
     * @param {*} values 
     */
    const onSubmitHandler = async (values) => {
        const formData = new FormData();

        Object.keys(values).forEach(key => formData.append(key, values[key]));

        // Add the cover file to the form data
        if (state.cover.length > 0) state.cover.forEach(file => formData.append(INPUT_COVER, file))

        // Adds the images files to the form data
        if (state.files.length > 0) state.files.forEach(file => formData.append(INPUT_IMAGES, file))
        
        // Calling the uploadData function to submit the payload to the server.
        uploadData(formData);
    };

    const uploadData = async (data, options) => {
        console.log(`${window.location.host}/api/catchpoints`)

        const config = {
            headers: { "Content-Type": "multipart/form-data" },
            url: `http://localhost:3000/api/catchpoints`,
            method: 'post',
            data: data,
            'content-type': 'multipart/form-data',
            onUploadProgress: (progressEvent => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log('Progress: ', percentCompleted);
            }),
            proxy: false 
        }

        axios.request(config)
            .then((response) => console.log(response.data))
            .catch((error) => console.log('error', error))
    }

    /**
     * Handles the file selection from the file input
     * @param {*} e 
     */
    const onFileChangeHandler = async (e) => {
        if(e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Check that the type of the file
            const reg_type = /^image\/(.*)$/;
            if (!file.type.trim().match(reg_type)) { alert('Incorrect file type'); return; }

            // Read the image to check the width and height of the image.
            dispatch({type: DISPATCH_SET_COVER_IMAGE, file: file})
        }

        // reinitialize the value
        e.target.value = '';
    }

    /**
     * Maneges the drop events for the cover image area
     * @param {*} e 
     */
    const onCoverroppedHandler = async (fs) => {
        dispatch({type: DISPATCH_SET_COVER_IMAGE, file: fs[0]})
    };

    return <FileDispatch.Provider value={dispatch}>
        <div className="p-2 m-auto w-10/12">
            <Formik
                initialValues={{
                    title: '',
                    subtitle: '',
                    desc: '',
                    subdesc: '',
                    time: '',
                    price: '',
                    point: '',
                    goods: '',
                }}
                onSubmit={onSubmitHandler}
            >
                <Form>
                    <div>
                        <fieldset className="border m-2 inline-block min-w-[512px] box-border p-3">
                            <legend className="ml-2">Catch Point information</legend>
                            <Field className="block my-2 border p-1 w-full text-[75%] block" name="title" placeholder="title" />
                            <Field className="block my-2 border p-1 w-full text-[75%]" name="subtitle" placeholder="subtitle" />
                            <Field className="block my-2 border p-1 w-full h-36 text-[75%]" as="textarea" name="desc" placeholder="Description" />
                            <Field className="block my-2 border p-1 w-full h-36 text-[75%]" as="textarea" name="subdesc" placeholder="Sub-description" />
                            <Field className="block my-2 border p-1 w-full text-[75%]" name="time" placeholder="time in min, Ex: 30" />
                            <Field className="block my-2 border p-1 w-full text-[75%]" name="price" placeholder="price" />
                            <Field className="block my-2 border p-1 w-full text-[75%]" name="point" placeholder="points" />
                            <Field className="block my-2 border p-1 w-full text-[75%]" name="goods" placeholder="goods" />
                        </fieldset>
                        <fieldset className="border m-2 min-w-[512px]">
                            <legend className="ml-2">Cover image</legend>
                            <FileDropArea
                                onFileDropped={onCoverroppedHandler}
                                addItemRenderer= {
                                    <li className="w-full min-h-[256px] h-[300px] m-auto block">
                                        <div className="w-full h-full rounded border-2 border-dashed flex justify-center items-center  cursor-pointer hover:bg-cyan-100/[.25]"
                                            onClick={(e) => {                        
                                                inputFileRef.current.click();
                                            }}
                                        >
                                            <FaPlus />
                                            <input onChange={onFileChangeHandler} onClick={(e) => {e.stopPropagation();}} ref={inputFileRef} type="file" className="hidden" accept="image/*"/>
                                        </div>
                                    </li>
                                }

                                renderItem={(file, index) => {
                                    return <li key={index} className="min-h-[256px] h-[300px] overflow-y-hidden w-auto m-2 mx-auto block w-auto relative transition-all duration-200">
                                        <BiX className="absolute rounded-full bg-red-500 hover:bg-red-700 text-white text-[20px] right-[10px] top-[10px] cursor-pointer" 
                                        onClick={(e) => {
                                            e.preventDefault();
                            
                                            dispatch({type: DISPATCH_UNSET_COVER_IMAGE});
                                        }}/>
                                        <FileThumbnailRenderer className="my-auto w-full" index={index} file={file} type={file.type} />
                                    </li>;
                                }}
                                files={state.cover}
                                maxItems={1}
                            />
                        </fieldset>
                        <fieldset className="border m-2 p-2 min-w-[512px]">
                            <legend className="ml-2">Mission images</legend>
                            <FileDropArea onFileDropped={onFileDroppedHandler} files={state.files} dispatch={dispatch} />
                        </fieldset>
                        <fieldset className="m-2 my-4 in-w-[512px] text-right">
                            <button className="w-28 p-2 bg-green-500 hover:bg-green-600 text-white transition-all duration-200" type="submit">Save</button>
                        </fieldset>
                    </div>
                </Form>
            </Formik>
        </div>
    </FileDispatch.Provider>
}

/**
 * 
 * @param {*} props 
 * @returns 
 */
function FileDropArea(props) {
    const dispatch = useContext(FileDispatch);
    const maxItems = props.maxItems || -1;
    const files = props.files || [];
    const inputFileRef = useRef(null);

    const onDragEnter = (e) => {
        e.preventDefault();

        if(files.length === maxItems) return;

        e.currentTarget.classList.add("border-2");
        e.currentTarget.classList.add("border-dashed");
        e.currentTarget.classList.add("border-cyan-400");
    }

    /**
     * 
     * @param {*} e 
     */
    const onDragLeave = (e) => {
        e.preventDefault();

        if(files.length === maxItems) return;

        e.currentTarget.classList.remove("border-2");
        e.currentTarget.classList.remove("border-dashed");
        e.currentTarget.classList.remove("border-cyan-400");
    }

    /**
     * 
     * @param {*} e 
     */
    const onDrop= async (e) =>{
        e.preventDefault();

        if(files.length === maxItems) return;

        e.currentTarget.classList.remove("border-2");
        e.currentTarget.classList.remove("border-dashed");
        e.currentTarget.classList.remove("border-cyan-400");

        const fs = getDatatransferFiles(e);

        callback(props.onFileDropped, fs);
    }

    /**
     * Handles the file selection from the file input
     * @param {*} e 
     */
    const onFileChangeHandler = (e) => {
        console.log('file', e)
    }

    // Child renderer
    const renderItem = props.renderItem || ((file, index) => {
        return <li key={index} className="min-h-[256px] h-[400px] m-2 inline-block align-middle relative transition-all duration-200">
            <BiX className="absolute rounded-full bg-red-500 hover:bg-red-700 text-white text-[20px] right-[10px] top-[10px] cursor-pointer drop-shadow-md" 
            onClick={(e) => {
                e.preventDefault();

                dispatch({type: DISPATCH_REMOVE_FILE, id: index});
            }}/>
            <FileThumbnailRenderer index={index} file={file} type={file.type} />
        </li>;
    });

    // Empty list renderer - Item to display when the list is empty
    const addItem = props.addItemRenderer || (
        <li className="w-[224px] min-h-[256px] h-[400px] m-2 inline-block align-middle">
            <div className="w-full h-full rounded border-2 border-dashed flex justify-center items-center">
                <FaPlus />
                <input onChange={onFileChangeHandler} ref={inputFileRef} type="file" className="hidden"/>
            </div>
        </li>);

    // Generates the view for the children
    const children = files.map(renderItem);

    return (
        <div className="flex box-border">
            <ul className={`${props.className || ''} overflow-x-scroll w-[700px] whitespace-nowrap flex-1 p-2 box-border transition-all duration-200`}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
            >
                {children}
                {(files.length != maxItems)? addItem : null}
            </ul>
        </div>
    );
}

/**
 * 
 * @param {*} props 
 * @returns 
 */
const FileThumbnailRenderer = (props) => {
    const [source, setSource] = useState(null)
    const [display, setDisplay] = useState(false)
    // If we want to perform an action, we can get dispatch from context.
    const dispatch = useContext(FileDispatch);
    const className = props.className || "inline-block align-middle h-[400px]";

    useEffect(() => {
        const updateSource = async () => {
            const data = await readFile(props.file);
            const image = await readImage(data);

            if(image.width < MIN_HEIGHT) {
                dispatch({type: DISPATCH_REMOVE_FILE, id: props.index});
                return;
            }

            setSource(image.src)
            setDisplay(true);
        }

        updateSource();
    })

    return (
        <>
        {display ? <img className={className} src={source}/> : null}
        </>
    )
};

