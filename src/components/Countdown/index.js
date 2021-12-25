import React, {useEffect, useState} from 'react'
import PropTypes from "prop-types";
import './Countdown.scoped.scss'

function Countdown(props) {
    const [completed, setCompleted] = useState(props.date.getTime() <= Date.now())
    const [countdown, setCountdown] = useState(() => calcCountdown())

    function calcCountdown() {
        let days, hours, minutes, seconds
        days = hours = minutes = seconds = '00'

        const distance = props.date.getTime() - Date.now()
        if (distance > 0) {
            function pad(count) {
                return String(count).padStart(2, '0')
            }

            days = pad(Math.floor(distance / (1000 * 60 * 60 * 24)))
            hours = pad(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
            minutes = pad(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)))
            seconds = pad(Math.floor((distance % (1000 * 60)) / 1000))
        } else {
            setCompleted(true)
        }

        return {
            days,
            hours,
            minutes,
            seconds,
        }
    }

    useEffect(() => {
        let clock
        if (!completed) {
            clock = setInterval(() => {
                setCountdown(calcCountdown())
                if (completed) {
                    clearInterval(clock)
                    clock = null
                }
            }, 1000)
        }
        return function() {
            clock && clearInterval(clock)
        }
    })

    return (
        <div>
            {
                completed
                    ? props.children
                    : <>
                        { props.prepend && <div className="prepend">
                            {props.prepend}
                        </div>}
                        <div className="countdown">
                            <div className="item">
                                <div className="count">
                                    {countdown.days}
                                </div>
                                <label>Days</label>
                            </div>
                            <div className="item">
                                <div className="count">
                                    {countdown.hours}
                                </div>
                                <label>Hours</label>
                            </div>
                            <div className="item">
                                <div className="count">
                                    {countdown.minutes}
                                </div>
                                <label>Minutes</label>
                            </div>
                            <div className="item">
                                <div className="count">
                                    {countdown.seconds}
                                </div>
                                <label>Seconds</label>
                            </div>
                        </div>
                    </>
            }
        </div>
    )
}

Countdown.protoTypes = {
    date: PropTypes.instanceOf(Date)
}

export default Countdown
