import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Collapse} from 'react-collapse';
import ClassNames from 'classnames'

import './FAQ.scoped.scss'
import './FAQ.scss'
import React from "react";

function FAQ(props) {
    return (
        <div className={ClassNames(['faq-item', {active: props.active}])}>
            <div className="question" onClick={() => props.onToggle(props.question)}>
                <h3>{props.question}</h3>
                <FontAwesomeIcon icon={props.active ? 'minus' : 'plus'}/>
            </div>
            <Collapse isOpened={props.active}>
                <div className="answer">
                    <p>
                        {props.answer}
                    </p>
                </div>
            </Collapse>
        </div>
    )
}

export default FAQ
