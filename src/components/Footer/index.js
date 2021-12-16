import './Footer.scoped.scss'
import Button from 'react-bootstrap/Button';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ReactComponent as Divider} from 'assets/zigzag-divider.svg';

function Footer() {
    return (
        <footer>
            <div className="wrapper footer">
                <div className="container">
                    <h2>SUPPORT US BY FOLLOWING OUR SOCIALS</h2>
                    <Button as={'a'} href={'https://twitter.com/CryptoChimpzNFT'} target={'_blank'}
                            variant={'social'}>
                        <FontAwesomeIcon icon={['fab', 'twitter']}/>
                    </Button>
                    <Button as={'a'} href={'https://instagram.com/CryptoChimpzNFT'} target={'_blank'}
                            variant={'social'}>
                        <FontAwesomeIcon icon={['fab', 'instagram']}/>
                    </Button>
                    <Button as={'a'} href={'https://discord.com/invite/Hbq5UwPMhk'} target={'_blank'}
                            variant={'social'}>
                        <FontAwesomeIcon icon={['fab', 'discord']}/>
                    </Button>
                </div>
                <Divider className={'divider'}/>
            </div>
            <div className="wrapper copyright">
                <div className="container">
                    Copyright © {(new Date()).getFullYear()} Crypto Chimpz | Powered by The ChimpStar Galaxy
                </div>
            </div>
        </footer>
    )
}

export default Footer
