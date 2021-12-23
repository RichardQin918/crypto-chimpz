import React from "react";
import PropTypes from 'prop-types';
import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
  
  &::after {
    content: '';
    display: block;
    padding-bottom: ${({paddingBottom}) => paddingBottom}%;
  }
`
const Img = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

function Image(props) {
    const [w, h] = props.aspectRatio.split(':')
    const paddingBottom = h / w * 100

    return (
        <Wrapper style={{...props.style}} className={props.className} paddingBottom={paddingBottom}>
            <Img src={props.src} alt={props.alt || ''}/>
        </Wrapper>
    )
}

Image.protoTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    aspectRatio: PropTypes.string,
}

Image.defaultProps = {
    aspectRatio: '1:1'
}

export default Image
