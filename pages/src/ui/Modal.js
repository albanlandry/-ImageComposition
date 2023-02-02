import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import { Field, Form, Formik, FormikProps } from 'formik';
import {MdLink, MdLinkOff} from 'react-icons/md'

/**
 * 
 * @param {*} props 
 * @returns 
 */
function ModalLoader(props) {
    const modalIsOpen = props.modalIsOpen;
    const onCloseEvent = props.onClose || (() => { });
    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            zIndex: '999999'
        },
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            background: 'transparent',
            overflow: 'hidden',
            border: 'none',
            zIndex: '999999'
        }
    };


    useEffect(() => {
        if(props.onModalOpen) {
            props.onModalOpen();
        }
    }, [])

    return (
        <Modal
            isOpen={modalIsOpen}
            contentLabel="Paint Image"
            style={styles}
        /*
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onClose
        Event}
        */
        >
            <div className="lds-facebook">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </Modal>
    );
}

/**
 * 
 * @param {*} props 
 * @returns 
 */
function ModalAlert(props) {
    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#5D5D5DAA 0% 0% no-repeat padding-box',
            /*opacity: 0.75,*/
            zIndex: '999999'
        },
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            background: '#333333',
            overflow: 'hidden',
            border: 'none',
            opacity: 1,
            height: '245px',
            width: '425px',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '0px',
            zIndex: '999999',
            borderRadius: '10px'
        }
    };


    useEffect(() => {
        if(props.onModalOpen) {
            props.onModalOpen();
        }
    }, [])

    return (
        <Modal
            isOpen={props.modalIsOpen}
            contentLabel="Alert"
            style={styles}
        >
            <div className="modal-alert" style={{
                color: 'white',
                fontWeight: '100',
            }}>
                <div className="modal-alert-title">
                </div>
                <div className="modal-alert-main text-center" style={{
                    textAlign: 'center',
                }}>
                    <p dangerouslySetInnerHTML={{ __html: props.text || "" }}></p>
                </div>
                <div className="modal-alert-button text-center mt-[35px]" style={{
                    textAlign: 'center',
                    marginTop: '35px'
                }}>
                    <button onClick={props.onCancelButton || (() => { })()} style={{
                        borderRadius: '3px', width: '120px', 
                        height: '40px',
                        background: '#B10303'
                    }}>
                        취소
                    </button>
                    <span className="" style={{display: 'inline-block', margin: '0px 8px'}}></span>
                    <button onClick={props.onOkButton || (() => { })()} style={{ borderRadius: '3px', width: '120px', height: '40px', background: '#000000'}}>
                        나가기
                    </button>
                </div>
            </div>
        </Modal>
    );
}

/* Custom component css ******************************************************************************/
// New composition modal customo style
const newCompCustomStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: 'auto',
        transform: 'translate(-50%, -50%)',
        padding: '15px 20px'
    },
};

/** Customized UI Gallery  ***********************************************************************/
const LabelledFormikField = (props) => {
    const label = props.label || '';
    const type = props.type || 'text';
    const name = props.name || '';

    return(
        <div className={`${props.className || ''}`}>
            <label className="font-light text-sm mx-4 inline-block min-w-[50px]" htmlFor={`${name}`}>{label}</label>
            <Field className="p-2 border" id={`${name}`} type={`${type}`} name={`${name}`} {...props} />
        </div>
    );
};

/**
 * UI - CustomCheckBox
 * @param {*} props 
 * @returns 
 */
const CustomCheckBox = (props) => {
    const [isChecked, check] = useState(props.checked);

    /**
     * 
     * @param {*} e 
     */
    const onClickHandler = (e) => {
        e.preventDefault();

        const newValue = !isChecked;
        check(newValue);

        if(props.onChange) props.onChange(newValue);
    }

    return <div className="inline-block relative hover:bg-[#ECECEC]/[0.5] p-1 rotate-90" onClick={onClickHandler}>
        <Field className="absolute cursor-pointer h-0 w-0 opacity-0" name="linkInput" type="checkbox"/>
        {isChecked ? <MdLink /> : <MdLinkOff />}
    </div>
}

/**
 * 
 * @param {*} props 
 * @returns 
 */
function ModalNewComposition(props) {
    // Data
    const [isOpen, setOpen] = useState(props.open);
    const [state, setState] = useState(props.data || {});

    // Functions
    const close = (e) => { 
        if(props.onRequestClose) props.onRequestClose(e);
    }

    /**
     * 
     * @param {*} e 
     */
    const updateWidth = (e) => {
        console.log(e.nativeEvent.target.value);
    }

    /**
     * 
     * @param {*} e 
     */
    const updateHeight = (e) => {

    }

    return (
        <Modal
        isOpen={props.open}
        style={newCompCustomStyles}
        onRequestClose={close}
        >
        <Formik
            initialValues={{
                width: state.width, 
                height: state.height
            }}
            onSubmit={(values, action) => {
                try {
                    props.onSubmit(values);
                } catch (e) {}
            }}
        >
            <Form>
                <fieldset className="border pb-2">
                    <legend className="mx-3">Image Size</legend>
                    <div className="p-2 relative flex">
                        <div>
                            <LabelledFormikField name="width" label="Width:" type="number" onKeyUp={updateWidth} />
                            <LabelledFormikField name="height" label="Height:" type="number" onKeyDown={updateHeight} />
                        </div>
                        <div className="p-1 flex items-center">
                            <CustomCheckBox checked/>
                        </div>
                    </div>
                </fieldset>
                <div className="mt-3 flex justify-end">
                    <button className="text-sm p-1 w-16 hover:bg-[#ECECEC]/[0.5]" type="button"
                    onClick={close}>취소</button>
                    <span className="inline-block w-2"></span>
                    <button className="text-sm text-white p-1 w-16 bg-[#0984e3] hover:bg-[#0984e3]/[0.9] active:ring-2" type="submit">확인</button>
                </div>
            </Form>
        </Formik>
    </Modal>
    );
}

export { ModalLoader, ModalAlert, ModalNewComposition };