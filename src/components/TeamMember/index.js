import Button from 'react-bootstrap/Button';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import './TeamMember.scoped.scss'

function TeamMember(props) {
    return (
        <div className={`member ${props.className}`}>
            <img src={props.avatar} alt={props.name}/>
            <h3>{props.name}</h3>
            <h4>{props.title}</h4>
            {props.twitter && (
                <Button as={'a'} href={`https://twitter.com/${props.twitter}`} target={'_blank'} variant={'twitter'}>
                    <FontAwesomeIcon icon={['fab','twitter']}/>
                    Twitter
                </Button>
            )}
            {props.instagram && (
                <Button as={'a'} href={`https://instagram.com/${props.instagram}`} target={'_blank'} variant={'instagram'}>
                    <FontAwesomeIcon icon={['fab','instagram']}/>
                    Instagram
                </Button>
            )}
        </div>
    )
}

export default TeamMember
