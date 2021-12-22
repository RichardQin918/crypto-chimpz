import React from "react";
// import {Link} from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ClassNames from 'classnames'
import {Collapse} from 'react-collapse';
import { HashLink as Link } from 'react-router-hash-link';
import scrollWithOffset from "utils/scrollWithOffset";

import './Header.scoped.scss'
import './Header.scss'
import Logo from 'assets/logo-white.png'
import Image from "components/Image";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
        }

        this.toggleMobileMenu = this.toggleMobileMenu.bind(this)
    }

    toggleMobileMenu() {
        this.setState({active: !this.state.active})
    }

    render() {
        return (
            <header>
                <div className="wrapper">
                    <div className="container">
                        <Image src={Logo} aspectRatio={'537:160'} alt="Crypto Chimpz" className="logo"/>
                        <div className="spacer"/>
                        <div className="menu">
                            <Link className="item" scroll={scrollWithOffset} to="#about">About</Link>
                            <Link className="item" scroll={scrollWithOffset} to="#roadmap">Roadmap</Link>
                            <Link className="item" scroll={scrollWithOffset} to="#roadmap-101">101% Roadmap</Link>
                            <Link className="item" scroll={scrollWithOffset} to="#faq">FAQ</Link>
                            <Link className="item" scroll={scrollWithOffset} to="#team">The Team</Link>
                        </div>
                        <div className={ClassNames(['mobile-toggle', 'item', {active: this.state.active}])}
                             onClick={this.toggleMobileMenu}>
                            <FontAwesomeIcon icon={this.state.active ? 'times' : 'bars'}/>
                        </div>
                    </div>
                </div>
                <Collapse isOpened={this.state.active}>
                    <div className={ClassNames(['mobile-menu'])}>
                        <Link className="item" onClick={this.toggleMobileMenu} scroll={scrollWithOffset} to="#about">About</Link>
                        <Link className="item" onClick={this.toggleMobileMenu} scroll={scrollWithOffset} to="#roadmap">Roadmap</Link>
                        <Link className="item" onClick={this.toggleMobileMenu} scroll={scrollWithOffset} to="#roadmap-101">101% Roadmap</Link>
                        <Link className="item" onClick={this.toggleMobileMenu} scroll={scrollWithOffset} to="#faq">FAQ</Link>
                        <Link className="item" onClick={this.toggleMobileMenu} scroll={scrollWithOffset} to="#team">The Team</Link>
                    </div>
                </Collapse>
            </header>
        )
    }
}

export default Header
