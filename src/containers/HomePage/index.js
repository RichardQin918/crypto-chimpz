import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button, Form, InputGroup} from 'react-bootstrap';
import Carousel from './Carousel'
import TeamMember from "components/TeamMember";
import FAQ from "components/FAQ";
import Image from 'components/Image'
import Modal from 'components/Modal'
import {Formik} from "formik";
import * as yup from 'yup'

import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

import './HomePage.scoped.scss';
import './HomePage.scss';
import {ReactComponent as Divider} from 'assets/zigzag-divider.svg';

import TeamMemberData from 'data/team'
import FAQData from 'data/faq'
import ReactCanvasConfetti from "react-canvas-confetti";
import ClassNames from "classnames";

import {Typography} from '@material-ui/core'

import {ethers} from "ethers";
import Contract from '../../config/Contract.json'

import MetaMaskOnboarding from "@metamask/onboarding";

const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost'
    ? 'http://localhost:9010'
    : undefined
export const onBoard = new MetaMaskOnboarding({forwarderOrigin})

gsap.registerPlugin(ScrollTrigger)

const sleep = ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeQuestion: '',
            mintModalVisible: false,
            mintAmount: 0,
            address: '',
            networkId: 0,
            chainId: 0,
            startWatch: false,

            availableAmount: 0,
            maxSupply: 0,
            maxMintAmount: 0,
            nftPerAddressLimit: 0,
            paused: false,
            onlyWhitelisted: false,
            isWhitelisted: false,
            cost: 0,
            loading: true,
            owner: '',
            soldOut: false,

            msgModalVisible: false,
            explorerHash: '',
        }

        this.confettiTrigger = null
        this.animationInstance = null
        this.openMintModal = this.openMintModal.bind(this)
        this.closeMintModal = this.closeMintModal.bind(this)
        this.toggleFAQ = this.toggleFAQ.bind(this)
        this.validateAmount = this.validateAmount.bind(this)

        this.validationSchema = yup.object().shape({
            amount: yup
                .number()
                .required('Mint amount is required')
                .positive('Mint amount has to be positive')
                .integer('Mint amount has to be an integer')
                .test({
                    name: 'checkSufficientAmount',
                    message: 'Replace validator here, try amount > 999',
                    test: this.validateAmount
                })
        })
    }

    validateAmount(amount) {
        const { availableAmount } = this.state
        console.log('av: ', availableAmount, typeof amount, amount)
        return amount <= availableAmount
    }

    openMintModal() {
        this.setState({mintModalVisible: true})
    }

    closeMintModal() {
        this.setState({mintModalVisible: false})
    }

    toggleFAQ(question) {
        if (this.state.activeQuestion === question) {
            this.setState({activeQuestion: ''})
        } else {
            this.setState({activeQuestion: question})
        }
    }

    makeShot(particleRatio, opts) {
        this.animationInstance && this.animationInstance({
            ...opts,
            resize: true,
            origin: {y: 0.7},
            particleCount: Math.floor(200 * particleRatio),
        });
    }

    fire() {
        this.makeShot(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        this.makeShot(0.2, {
            spread: 60,
        });
        this.makeShot(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        this.makeShot(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        this.makeShot(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }

    getInstance = (instance) => {
        this.animationInstance = instance;
    };

    closeMsgModal = () => {
        this.setState({
            msgModalVisible: false
        })
    }

    goToEtherscan = () => {
        const {explorerHash} = this.state
        window.open(`https://rinkeby.etherscan.io/tx/${explorerHash}`, "_blank")
    }

    handleMint = async () => {
        const {mintAmount, address} = this.state
        console.log('minting !: ', mintAmount, address)
        this.setState({
            mintDone: false
        }, async () => {
            try {
                let res = await this.contract.mint(mintAmount)
                console.log('res: ', res.hash)
                if (res.hash !== null) {
                    this.setState({
                        explorerHash: res.hash
                    }, async () => {
                        let receipt = await res.wait()
                        console.log('receipt: ', receipt)
                        if (receipt !== null && receipt !== undefined) {
                            this.setState({
                                msgModalVisible: true,
                                mintModalVisible: false
                            })
                        }
                    })

                }
            } catch (err) {
                console.log('mint call failed: ', err)
            }
        })
    }

    handleNewChain = (chainId) => {
        this.setState({
            chainId: chainId
        })
    }

    handleNewNetwork = (networkId) => {
        this.setState({
            networkId: Number(networkId)
        })
    }

    handleNewAccounts = (addr) => {
        let address = addr === undefined || addr.length < 1 ? '' : addr[0]
        this.setState({
            address: address
        })
    }

    updateAccounts = async (addr) => {
        console.log('account updated: ', addr)
        this.setState({
            loading: true
        }, async () => {
            this.handleNewAccounts(addr)
            await this.readContractInfo()
        })

    }

    initWeb3 = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.enable();
            } catch (err) {
                console.error('Error on init when getting accounts', err)
            }
            try {
                const newAccounts = await window.ethereum.request({
                    method: 'eth_accounts',
                })
                const chainId = await window.ethereum.request({
                    method: 'eth_chainId',
                })

                const networkId = await window.ethereum.request({
                    method: 'net_version',
                })
                this.handleNewChain(chainId)
                this.handleNewNetwork(networkId)
                this.handleNewAccounts(newAccounts)
            } catch (err) {
                console.log('check network failed: ', err)
            }
            window.ethereum.autoRefreshOnNetworkChange = false
            window.ethereum.on('chainChanged', this.handleNewChain)
            window.ethereum.on('networkChanged', this.handleNewNetwork)
            window.ethereum.on('accountsChanged', this.updateAccounts)
            this.setState({
                startWatch: true
            })
            await this.readContractInfo()
        }
    }

    readContractInfo = async () => {
        this.provider = ethers.getDefaultProvider(this.state.networkId)
        // this.contract = new ethers.Contract(Contract.address, Contract.abi, this.provider)
        this.signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
        this.contract = new ethers.Contract(Contract.address, Contract.abi, this.signer)
        try {
            let maxSupply = await this.contract.maxSupply()

            let maxMintAmount = await this.contract.maxMintAmount()

            let nftPerAddressLimit = await this.contract.nftPerAddressLimit()

            let onlyWhitelisted = await this.contract.onlyWhitelisted()

            let paused = await this.contract.paused()

            let cost = await this.contract.cost()

            let availableAmount = await this.contract.availableAmount()

            let isWhiteListed = await this.contract.isWhitelisted(this.state.address)

            let owner = await this.contract.owner()

            this.setState({
                maxSupply: ethers.BigNumber.from(maxSupply).toNumber(),
                maxMintAmount: ethers.BigNumber.from(maxMintAmount).toNumber(),
                nftPerAddressLimit: ethers.BigNumber.from(nftPerAddressLimit).toNumber(),
                cost: Number(ethers.utils.formatEther(cost)),
                availableAmount: ethers.BigNumber.from(availableAmount).toNumber(),
                paused,
                isWhiteListed,
                onlyWhitelisted, owner,
                soldOut: ethers.BigNumber.from(availableAmount).toNumber() === 0,
                loading: false
            })
        } catch (err) {
            console.log('read contract info error: ', err)
        }
    }

    sameAddress = (addr1, addr2) => {
        console.log('here: ', addr1, addr2, addr1.toLowerCase() === addr2.toLowerCase())
        return addr1.toLowerCase() === addr2.toLowerCase();

    }


    async componentDidMount() {
        // Hack to force scroll triggers to work properly, TODO: listen for image load event
        setTimeout(() => {
            document.querySelectorAll('#roadmap .line, #roadmap .circle').forEach(el => {
                gsap.timeline({
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 40%',
                        end: 'bottom 40%',
                        scrub: true,
                    }
                }).fromTo(el, {
                    background: "linear-gradient(to bottom, #21FA90 0%, #fff 0%, #fff 100%)",
                    ease: 'none',
                }, {
                    background: "linear-gradient(to bottom, #21FA90 100%, #fff 100%, #fff 100%)",
                    ease: 'none',
                })
            })
            document.querySelectorAll('#roadmap .percentage, #roadmap h3').forEach(el => {
                gsap.timeline({
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 40%',
                        end: 'bottom 40%',
                        scrub: true,
                    }
                }).to(el, {
                    color: "#21FA90",
                    ease: 'none',
                })
            })

            this.confettiTrigger = ScrollTrigger.create({
                trigger: '#roadmap .timeline',
                start: 'bottom 40%',
                end: 'bottom top',
                onToggle: self => {
                    if (self.isActive && self.direction > 0) {
                        this.fire()
                        self.kill()
                        this.confettiTrigger = null
                    }
                }
            })

            gsap.timeline({
                scrollTrigger: {
                    trigger: document.querySelector('#roadmap .timeline .trigger'),
                    pin: document.querySelector('#roadmap .indicator'),
                    start: '20px 40%',
                    end: 'bottom+=40 40%',
                    scrub: true,
                }
            }).to(document.querySelector('#roadmap .indicator'), {
                backgroundColor: "#21FA90",
                ease: 'none',
            })
        }, 500)
        await this.initWeb3()
    }

    componentWillUnmount() {
        this.confettiTrigger && this.confettiTrigger.kill()
    }

    mint() {
        console.log('Minting')
    }

    render() {
        const {
            loading,
            maxSupply,
            maxMintAmount,
            availableAmount,
            cost,
            paused,
            nftPerAddressLimit,
            isWhitelisted,
            onlyWhitelisted,
            address,
            owner,
            soldOut
        } = this.state

        const TeamMembers = TeamMemberData.map(member => (
            <TeamMember {...member} key={member.name} className={'col-12 col-sm-6 col-lg-3'}/>
        ))

        const FAQs = FAQData.map(item => (
            <FAQ {...item} key={item.question} onToggle={this.toggleFAQ}
                 active={this.state.activeQuestion === item.question}/>
        ))

        return (
            <div>
                <div className="wrapper banner">
                    <div className="container">
                        <div className="content ">
                            <h1 className={'logo'}>CRYPTO <br/> CHiMPZ</h1>
                            <h2>TO THE MOOOOON</h2>
                            <div className={'row gx-3'}>
                                <div className="col-6">
                                    <Button as={'a'} href={'https://twitter.com/CryptoChimpzNFT'} target={'_blank'}
                                            variant={'twitter'} className={'rounded-pill'}>
                                        <FontAwesomeIcon icon={['fab', 'twitter']}/>
                                        Updates
                                    </Button>
                                </div>
                                <div className="col-6">
                                    <Button as={'a'} href={'https://discord.com/invite/Hbq5UwPMhk'} target={'_blank'}
                                            variant={'discord'} className={'rounded-pill'}>
                                        <FontAwesomeIcon icon={['fab', 'discord']}/>
                                        Discord
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Divider className={'divider'}/>
                </div>
                <div className="wrapper mint">
                    <div className="container">
                        <Button size={"lg"}
                                onClick={() => window.ethereum ? this.openMintModal() : onBoard.startOnboarding()}>
                            <FontAwesomeIcon icon={['fas', 'coins']}/>
                            MiNT NOW!!!
                        </Button>
                    </div>
                </div>
                <div className="wrapper intro" id={'about'}>
                    <div className="container">
                        <div className="row gx-5">
                            <div className="col-12 col-md-5 mb-5 mb-md-0 text-center text-md-start">
                                <Image src={require('./510.jpg')} style={{maxWidth: '400px'}}/>
                            </div>
                            <div className="col-12 col-md-7">
                                <h2 className={'text-center text-md-start'}>
                                    WELCOME TO THE CRYPTO CHiMPZ
                                </h2>
                                <p>
                                    Join us on our CryptoChimpz journey by viewing our roadmap. Strap in as the road
                                    ahead is bumpy, but fruitful! The CryptoChimpz were forced into turmoil and 10,000
                                    of them have been captured after a brutal invasion by humans on the ChimpStar
                                    Galaxy. The Chimpz have suffered brutal testing by the humans in their labs, but
                                    have now broken free.
                                </p>
                                <p>
                                    The Chimpz need your help! They will need to adapt and familiarize themselves with
                                    the Earth. Only you can propel the CryptoChimpz back to the ChimpStar Galaxy and
                                    help them return home.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="wrapper" style={{display: 'block'}}>
                    <Carousel/>
                </div>
                <div className="wrapper roadmap" id={'roadmap'}>
                    <div className="container">
                        <h2>ROADMAP</h2>
                        <div className="timeline">
                            <div className={'indicator'}/>
                            <div className="trigger">
                                <div className="item">
                                    <div className="line"/>
                                    {/*<div className="circle"/>*/}
                                    <div className="percentage">0%</div>
                                    <div className="content">
                                        <h3>Who Let the Chimpz Out!</h3>
                                        <p>
                                            Join the Discord Server and introduce yourself, we will be giving away 5-10
                                            NFTs
                                            to active discord members and on our Twitter via giveaways. Active discord
                                            members or members with a minimum 15 invites will be whitelisted for the
                                            pre-sale!
                                        </p>
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="line"/>
                                    {/*<div className="circle"/>*/}
                                    <div className="percentage">25%</div>
                                    <div className="content">
                                        <h3>Community is Everything!</h3>
                                        <p>
                                            As the Chimpz break out and grow in numbers, they are attracting a lot of
                                            unwanted attention, they will need to fit in with the crowd! At this point,
                                            We
                                            will be investing <strong>$100,000</strong> worth of ETH into the
                                            CryptoChimpz
                                            community fund.
                                            This fund will be used to further grow our community through marketing
                                            efforts
                                            and to further develop the CryptoChimpz project.
                                        </p>
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="line"/>
                                    {/*<div className="circle"/>*/}
                                    <div className="percentage">50%</div>
                                    <div className="content">
                                        <h3>Drip Too Hard!</h3>
                                        <p>
                                            As the Chimpz eagerly try and survive, they discover human fashion and get
                                            dripped out, some Chimpz get drippy-er than others. The exclusive
                                            CryptoChimpz
                                            <strong>Merch store</strong> will now be available to all Chimp holders.
                                            These
                                            items will be more
                                            than just a T-shirt! 👀
                                        </p>
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="line"/>
                                    {/*<div className="circle"/>*/}
                                    <div className="percentage">75%</div>
                                    <div className="content">
                                        <h3>Save the Chimpz</h3>
                                        <p>
                                            Back at the ChimpStar Galaxy, the ChimpWives are becoming restless and
                                            impatient, worried about their Chimp companions. One of the Chimpz, known as
                                            the
                                            AstroChimp, has managed to figure out how to fly back to space and call
                                            their
                                            wives.
                                        </p>
                                        <p>
                                            We will be donating <strong>$50,000</strong> to a charity geared towards
                                            saving
                                            and conserving
                                            chimpanzees. The non-profit will be selected by the community. (These funds
                                            will
                                            not come out of the CryptoChimpz Fund!).
                                        </p>
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="line"/>
                                    {/*<div className="circle"/>*/}
                                    <div className="percentage">100%</div>
                                    <div className="content">
                                        <h3>Blast Off!</h3>
                                        <p>
                                            ChimpWives have been summoned by the AstroChimp, and they are on the lookout
                                            for
                                            their partners and will turn every inch of space inside out to ensure their
                                            husbands are returned home!
                                        </p>
                                        <p>
                                            We will be giving away <strong>$100,000</strong> worth of ETH. All
                                            CryptoChimpz
                                            will get a <strong>free</strong>
                                            mint pass to mint a ChimpWife. All holders of the ChimpWife will be able to
                                            <strong>breed</strong> the two to produce a CryptoChimpKid.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="line"/>
                                {/*<div className="circle"/>*/}
                                <div className="percentage">101%</div>
                                <div className="content">
                                    <h3>Wait, there’s more!</h3>
                                    <p>
                                        The skies light up and we see 100’s of spaceships landing, that’s right,
                                        ChimpWives to the rescue! 10,000 ChimpWives have come to the help of their
                                        beloved CryptoChimpz to take them back to the ChimpStar Galaxy. Congratulations!
                                    </p>
                                    <p>
                                        You are now a CryptoChimp holder, start your CryptoChimp family, and await the
                                        3DChimpz. The journey is anything but over, the ChimpStar Galaxy will have its
                                        revenge…
                                    </p>
                                </div>
                            </div>
                        </div>
                        <ReactCanvasConfetti className={'canvas'} refConfetti={this.getInstance}/>
                    </div>
                </div>
                <div className="wrapper roadmap-101" id={'roadmap-101'}>
                    <div className="container">
                        <h2>101% ROADMAP</h2>
                        <div className="item">
                            <h3>1 of 1 CHiMPZ</h3>
                            <p>
                                Owners of the 1 of 1 Crypto Chimpz will receive <strong>1ETH</strong> each 🚀
                            </p>
                        </div>
                        <div className="item">
                            <h3>BUiLD-A-CHiMP</h3>
                            <p>
                                After the mint is complete, some Chimp holders might see a blank Chimp with a question
                                mark. If you are a holder of 1 of 10 Build-a-Chimpz, you will be able
                                to <strong>customize</strong> your Chimp any way you’d like!
                            </p>
                        </div>
                        <div className="item">
                            <h3>STAKING ($CHIMPZ)</h3>
                            <p>
                                Crypto Chimp holders can <strong>stake their NFTs</strong> and
                                earn <strong>daily</strong> tokens. Holders will have the option to use the tokens to
                                alter their CryptoChimp, redeem it for merch, or even unlock their <strong>Metaverse-Ready
                                3D Chimp</strong>. Chimp tokens will also allow holders to sell their tokens and will
                                also allow holders access to different items in the near future. % of royalties will go
                                towards the <strong>liquidity pool</strong>.
                            </p>
                        </div>
                        <div className="item">
                            <h3>ANiMATED SERiES</h3>
                            <p>
                                What’s better than reading a story, it’s watching that story, and what’s better than
                                watching a story, it’s watching an <strong>animated story</strong>! That’s right,
                                CryptoChimpz will be officially launching and producing an <strong>animated CryptoChimpz
                                series</strong> of shorts that will feature your favorite NFT’s, 1 of 1’s, legendary
                                NFT’s, and even some new ones. 👀
                            </p>
                        </div>
                        <div className="item">
                            <h3>CHiMP STORE</h3>
                            <p>
                                Stay tuned and don’t miss out on the jam-packed adventure we have in store for you!
                                Speaking of stores, CryptoChimpz will officially be opening a brand new CryptoChimp
                                store.
                            </p>
                            <p>
                                The Crypto Chimpz exclusive store will be opening a physical location, pop up shops all
                                around the globe, and will also be available to all chimp
                                holders <strong>online</strong>.
                            </p>
                            <p>
                                The Crypto Chimpz store will be exclusive only to chimp holders. We will be releasing
                                a <strong>limited-edition figure/toy</strong> and an exclusive clothing line for all our
                                chimps.
                            </p>
                        </div>
                        <div className="item">
                            <h3>CARE PACKAGES</h3>
                            <p>
                                <strong>250 OG Chimpz</strong> will receive a care package full of unique items (more to
                                be announced soon)
                            </p>
                            <p>
                                <strong>100 care packages</strong> will also be given away randomly to anyone who mints
                                more than 2 CryptoChimpz.
                            </p>
                        </div>
                        <div className="item">
                            <h3>ARTiST TATTOO</h3>
                            <p>
                                The project’s artist <strong>@Generous</strong> will get a Crypto Chimpz tattoo 🤣
                            </p>
                        </div>
                    </div>
                </div>
                <div className="wrapper faq" id={'faq'}>
                    <div className="container">
                        <h2>F.A.Q</h2>
                        {FAQs}
                    </div>
                </div>
                <div className="wrapper team" id={'team'}>
                    <div className="container">
                        <h2>OUR TEAM</h2>
                        <div className={'row'}>
                            {TeamMembers}
                        </div>
                    </div>
                </div>

                <Modal
                    width="300px" showHeader={false}
                    visible={this.state.msgModalVisible}
                    onClose={this.closeMsgModal}
                >
                    <div className="status">
                        <FontAwesomeIcon icon={'check-circle'}/>
                        <div className="message">
                            Mint Requested <br/><br/>
                            <Button variant={'primary'} onClick={this.goToEtherscan}>
                                Check On Etherscan
                            </Button>
                        </div>
                    </div>
                </Modal>

                <Modal
                    width="400px" title={'Mint Information'}
                    visible={this.state.mintModalVisible}
                    onClose={this.closeMintModal}
                    loading={loading} loadingText={'Loading Mint Information'}
                >
                    {
                        soldOut ?
                            <div className="status">
                                <FontAwesomeIcon icon={'empty-set'}/>
                                <div className={'message'}>All Crypto Chimpz NFT has been minted!</div>
                            </div>
                            : paused ?
                                <div className="status">
                                    <FontAwesomeIcon icon={'pause-circle'}/>
                                    <div className={'message'}>Minting temporarily paused, please wait for further
                                        information
                                    </div>
                                </div>
                                : !this.sameAddress(owner, address) && (this.state.onlyWhitelisted && !this.state.isWhitelisted) ?
                                    <div className="status">
                                        <FontAwesomeIcon icon={'hourglass-half'}/>
                                        <div className={'message'}>Your address is not registered for pre-sale. Public sale
                                            will start soon!
                                        </div>
                                    </div>
                                    : <>
                                        <Typography
                                            style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>
                                            {'Available/Total'}
                                        </Typography>

                                        <Typography
                                            style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>
                                            {`${this.state.availableAmount} / ${this.state.maxSupply}`}
                                        </Typography>

                                        <Formik
                                            initialValues={{amount: ''}}
                                            validationSchema={this.validationSchema}
                                            onSubmit={(values, {setSubmitting, resetForm}) => {
                                                setSubmitting(true)
                                                setTimeout(() => {
                                                    alert(JSON.stringify(values))
                                                    resetForm()
                                                    setSubmitting(false)
                                                }, 1000)
                                            }}
                                        >
                                            {
                                                ({
                                                     values,
                                                     errors,
                                                     touched,
                                                     handleChange,
                                                     handleBlur,
                                                     handleSubmit,
                                                     isSubmitting,
                                                     setFieldValue,
                                                     setFieldTouched,
                                                 }) => (
                                                    <Form onSubmit={handleSubmit} className={'row g-3'}>
                                                        <Form.Group controlId={'formAmount'} className={'col-12'}>
                                                            <Form.Label>Amount</Form.Label>
                                                            <InputGroup
                                                                size={'lg'}
                                                                className={ClassNames([{'is-invalid': errors.amount}])}>
                                                                <Button variant={'outline-secondary'} onClick={() => {
                                                                    setFieldValue('amount', --values.amount)
                                                                    setFieldTouched('amount')
                                                                }}>
                                                                    <FontAwesomeIcon icon={'minus'}
                                                                                     style={{marginRight: 0}}/>
                                                                </Button>
                                                                <Form.Control
                                                                    type={'number'} placeholder={'Enter amount'}
                                                                    name={'amount'} value={values.amount}
                                                                    className={ClassNames(['text-center', {'is-invalid': errors.amount}])}
                                                                    autoComplete={'off'}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                />
                                                                <Button variant={'outline-secondary'} onClick={() => {
                                                                    setFieldValue('amount', ++values.amount)
                                                                    setFieldTouched('amount')
                                                                }}>
                                                                    <FontAwesomeIcon icon={'plus'}
                                                                                     style={{marginRight: 0}}/>
                                                                </Button>
                                                            </InputGroup>
                                                            {touched.amount && errors.amount ? (
                                                                <div className="invalid-feedback">{errors.amount}</div>
                                                            ) : null}
                                                        </Form.Group>
                                                        <div className="col-12 text-end">
                                                            <Button className={'mint-btn w-100'} variant={'primary'}
                                                                    type={'submit'}
                                                                    disabled={isSubmitting}>
                                                                {isSubmitting &&
                                                                    <FontAwesomeIcon icon={'spinner-third'} spin/>}
                                                                MiNT
                                                            </Button>
                                                        </div>
                                                    </Form>
                                                )
                                            }
                                        </Formik>
                                    </>

                    }

                </Modal>
            </div>
        )
    }
}

export default HomePage;
