import {CSSTransition} from "react-transition-group";
import ClassNames from "classnames";
import PropTypes from "prop-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Fragment} from "react";

import './Modal.scoped.scss'

function Modal(props) {
    function handleClose() {

    }

    return (
        <div className={ClassNames(['modal-wrapper', {active: props.visible}])}>
            <CSSTransition in={props.visible} timeout={500} classNames={'fade'} unmountOnExit>
                <div className="backdrop"/>
            </CSSTransition>
            <CSSTransition in={props.visible} timeout={500} classNames={'reveal'} unmountOnExit>
                <div className={'modal'} style={{maxWidth: props.width}}>
                    {props.showHeader && <div className="header">
                        {props.header
                            ? <Fragment>
                                {props.header}
                            </Fragment>
                            : <div className={'default'}>
                                <h2>{props.title}</h2>
                                {props.showClose &&
                                    <button className="close-button" onClick={props.onClose}>
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
}

Modal.defaultProps = {
    visible: false,
    showClose: true,
    closeOnClickModal: true,
    showHeader: true,
    width: '600px',
}

export default Modal
