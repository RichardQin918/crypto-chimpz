import React from 'react'
import {CSSTransition} from "react-transition-group";
import ClassNames from "classnames";
import PropTypes from "prop-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Fragment, useEffect} from "react";

import './Modal.scoped.scss'

const bodyScrollLock = require('body-scroll-lock');
const disableBodyScroll = bodyScrollLock.disableBodyScroll;
const enableBodyScroll = bodyScrollLock.enableBodyScroll;

function Modal(props) {
    const modalRef = React.createRef()

    const handleClose = () => {
        props.onClose()
    }

    useEffect(() => {
        if (props.visible) {
            lockBodyScroll()
        } else {
            unlockBodyScroll()
        }
    }, [props.visible])

    useEffect(() => {
        return function cleanUp() {
            modalRef.current && unlockBodyScroll()
        }
    })

    function lockBodyScroll() {
        disableBodyScroll(modalRef.current, {
            allowTouchMove: el => {
                while (el && el !== document.body) {
                    if (el.getAttribute('body-scroll-lock-ignore') !== null) {
                        return true;
                    }

                    el = el.parentElement;
                }
            },
        })
    }

    function unlockBodyScroll() {
        enableBodyScroll(modalRef.current)
    }

    return (
        <div ref={modalRef} className={ClassNames(['modal-wrapper', {active: props.visible}])}>
            <CSSTransition in={props.visible} timeout={500} classNames={'fade'} unmountOnExit>
                <div className="backdrop" onClick={() => props.closeOnClickModal && handleClose()}/>
            </CSSTransition>
            <CSSTransition
                in={props.visible} timeout={500}
                classNames={'reveal'} unmountOnExit
            >
                <div className={'modal'} style={{maxWidth: props.width}}>
                    {props.loading
                        ? <div className="spinner">
                            <FontAwesomeIcon icon={'spinner-third'} spin/>
                            {props.loadingText && <p>{props.loadingText}</p>}
                        </div>
                        : <>
                            {props.showHeader && <div className="header">
                                {props.header
                                    ? <Fragment>
                                        {props.header}
                                    </Fragment>
                                    : <div className={'default'}>
                                        <h2>{props.title}</h2>
                                        {props.showClose &&
                                            <button className="close-button" onClick={handleClose}>
                                                <FontAwesomeIcon icon={['fas', 'times']}/>
                                            </button>}
                                    </div>}
                            </div>}

                            <div className="body">
                                {props.children}
                            </div>

                            {props.footer && <div className="footer">
                                {props.footer}
                            </div>}
                        </>
                    }
                </div>
            </CSSTransition>
        </div>
    )
}

Modal.protoTypes = {
    visible: PropTypes.bool,
    showClose: PropTypes.bool,
    title: PropTypes.string,
    closeOnClickModal: PropTypes.bool,
    showHeader: PropTypes.bool,
    width: PropTypes.string,
    onClose: PropTypes.func,
    loadingText: PropTypes.string,
}

Modal.defaultProps = {
    visible: false,
    showClose: true,
    closeOnClickModal: true,
    showHeader: true,
    width: '600px',
    loadingText: 'Loading...'
}

export default Modal
