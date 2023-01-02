import React, {useState, useRef, useEffect} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Template from '../src/Template';
import {FaPlus} from 'react-icons/fa';

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
 * @param {*} props 
 * @returns 
 */
function FileDropArea(props) {

    const onDrop= async (e) =>{
        console.log(e.target);
        e.stopPropagation();
        e.preventDefault();

        const files = getDatatransferFiles(e);

        console.log(files);
    }

    return (
        <div className="flex">
            <ul className={`${props.className || ''} overflow-x-scroll w-[700px] whitespace-nowrap flex-1`}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={onDrop}
            >
                <li className="w-[224px] h-[256px] m-2 inline-block">
                    <div className="w-full h-full rounded border-2 border-dashed flex justify-center items-center">
                        <FaPlus />
                    </div>
                </li>
                <li className="w-[224px] h-[256px] m-2 inline-block">
                    <div className="w-full h-full rounded border-2 border-dashed flex justify-center items-center">
                        <FaPlus />
                    </div>
                </li>
                <li className="w-[224px] h-[256px] m-2 inline-block">
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
 */
export default function CatchpointForm(props) {
    const onSubmitHandler = async (values) => {

    };

    return <>
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
                        <FileDropArea />
                    </fieldset>
                </div>
            </Form>
        </Formik>
    </>
}