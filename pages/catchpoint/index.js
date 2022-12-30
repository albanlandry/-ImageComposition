import React, {useState, useRef, useEffect} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Template from '../src/Template';

/**
 * 
 * @param {*} props 
 */
export default function CatchpointForm(props) {

    return <>
        <Formik>
            <Form>
                <fieldset>
                    <legend>data</legend>
                    <Field className="block" name="title" />
                    <Field className="block" name="subtitle" />
                    <Field className="block" as="textarea" name="desc" />
                    <Field className="block" as="textarea" name="subdesc" />
                </fieldset>
            </Form>
        </Formik>
    </>
}