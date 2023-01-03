import React, { useContext, useEffect, useRef, useReducer, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Template from '../src/Template';
import {FaPlus} from 'react-icons/fa';
import {CiCircleRemove} from 'react-icons/ci';
import {BiX} from 'react-icons/bi';
import { callback, getDatatransferFiles, readFile, readImage } from '../src/Utils';

const MIN_HEIGHT = 400;
const DISPATCH_REMOVE_FILE = 'remove-file';
const DISPATCH_ADD_FILES = 'add-file';


/** Data management reducer */
const initialState = {files: [], errMessages: []};
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
            return { files: state.files.filter((_, idx) => {
                return idx !== action.id })}
        case DISPATCH_ADD_FILES:
            return {files: state.files.concat(action.files)}
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

    const onFileDroppedHandler = (fs) => {
        dispatch({type: DISPATCH_ADD_FILES, files: fs});
    };

    /**
     * 
     * @param {*} values 
     */
    const onSubmitHandler = async (values) => {

    };

    return <FileDispatch.Provider value={dispatch}>
        <div>
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
                    <fieldset className="border m-2 inline-block">
                        <legend className="ml-2">Catch Point information</legend>
                        <Field className="block m-2 border p-1 rounded w-96" name="title" placeholder="title" />
                        <Field className="block m-2 border p-1 rounded w-96" name="subtitle" placeholder="subtitle" />
                        <Field className="block m-2 border p-1 rounded w-96 h-36" as="textarea" name="desc" placeholder="Description" />
                        <Field className="block m-2 border p-1 rounded w-96 h-36" as="textarea" name="subdesc" placeholder="Sub-description" />
                        <Field className="block m-2 border p-1 rounded w-96" name="time" placeholder="time in min, Ex: 30" />
                        <Field className="block m-2 border p-1 rounded w-96" name="price" placeholder="price" />
                        <Field className="block m-2 border p-1 rounded w-96" name="point" placeholder="points" />
                        <Field className="block m-2 border p-1 rounded w-96" name="goods" placeholder="goods" />
                    </fieldset>
                    <fieldset className="border m-2">
                        <legend className="ml-2">Cover image</legend>
                    </fieldset>
                    <fieldset className="border m-2 p-2">
                        <legend className="ml-2">Mission images</legend>
                        <FileDropArea onFileDropped={onFileDroppedHandler} files={state.files} dispatch={dispatch} />
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
    const files = props.files || [];

    console.log(files)

    const onDragEnter = (e) => {
        e.preventDefault();

        e.currentTarget.classList.add("border-2");
        e.currentTarget.classList.add("border-dashed");
        e.currentTarget.classList.add("border-cyan-400");
    }

    const onDragLeave = (e) => {
        e.preventDefault();

        e.currentTarget.classList.remove("border-2");
        e.currentTarget.classList.remove("border-dashed");
        e.currentTarget.classList.remove("border-cyan-400");
    }

    const onDrop= async (e) =>{
        e.preventDefault();
        e.currentTarget.classList.remove("border-2");
        e.currentTarget.classList.remove("border-dashed");
        e.currentTarget.classList.remove("border-cyan-400");

        const files = getDatatransferFiles(e);

        callback(props.onFileDropped, files);
    }

    // Generates the view for the children
    const children = files.map((file, index) => {
        console.log('Children', index)

        return <li key={index} className="min-h-[256px] h-[400px] m-2 inline-block align-middle relative">
            <BiX className="absolute rounded-full bg-red-500 hover:bg-red-700 text-white text-[24px] right-[-12px] top-[-12px] cursor-pointer" 
            onClick={(e) => {
                e.preventDefault();

                dispatch({type: DISPATCH_REMOVE_FILE, id: index});
            }}/>
            <FileThumbnailRenderer index={index} file={file} type={file.type} />
        </li>;
    });

    return (
        <div className="flex box-border">
            <ul className={`${props.className || ''} overflow-x-scroll w-[700px] whitespace-nowrap flex-1 p-2 box-border`}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
            >
                {children}
                <li className="w-[224px] min-h-[256px] h-[400px] m-2 inline-block align-middle">
                    <div className="w-full h-full rounded border-2 border-dashed flex justify-center items-center">
                        <FaPlus />
                    </div>
                </li>
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
    }, [props.source])

    return (
        <>
        {display ? <img className="inline-block align-middle h-[400px]" src={source}/> : null}
        </>
    )
};

