import React from "react";
import Slider from "react-slick";
import styled from "styled-components";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function importAll(r) {
    return r.keys().map(r);
}

const images = importAll(require.context('assets/slider', false, /\.\/.+\.(png|jpe?g|svg)$/));

class Carousel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const Slide = styled.div`
            &:focus-visible {
                outline: none;
            }
        `
        const Img = styled.img`
            width: 100%;
        `
        const slides = images.map((image, index) => {
            return (
                <Slide key={index}>
                    <Img src={image}/>
                </Slide>
            )
        })
        const settings = {
            lazyLoad: 'ondemand',
            infinite: true,
            arrows: false,
            autoplay: true,
            autoplaySpeed: 1500,
            speed: 500,
            slidesToShow: 10,
            swipeToSlide: true,
            responsive: [9,8,7,6,5,4,3,2].map(i => ({
                breakpoint: i*250,
                settings: {
                    slidesToShow: i
                }
            }))
        }
        return (
            <Slider {...settings}>
                {slides}
            </Slider>
        )
    }
}

export default Carousel
