import React, {useEffect} from 'react';
import Modal from 'react-modal';

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

export { ModalLoader, ModalAlert };