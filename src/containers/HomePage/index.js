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
import Countdown from 'components/Countdown'

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
import {isMobile} from 'react-device-detect';

import {ethers} from "ethers";
import Contract from '../../config/Contract.json'
import RewardContract from '../../config/RewardContract.json'
import RewardTokenContract from '../../config/RewardTokenContract.json'

import MetaMaskOnboarding from "@metamask/onboarding";
import openSea from '../../assets/opensea.png'

import Table from '../../components/Table/Table'

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
            claimModalVisible: false,
            mintAmount: 0,
            address: '',
            networkId: 0,
            chainId: 0,
            startWatch: false,

            availableAmount: 0,
            availablePresaleAmount: 0,
            maxSupply: 0,
            maxPresaleSupply: 0,
            maxMintAmount: 0,
            nftPerAddressLimit: 0,
            nftPerAddressPresaleLimit: 0,
            paused: false,
            onlyWhitelisted: false,
            isWhitelisted: false,
            cost: 0,
            presaleCost: 0,
            loading: true,
            owner: '',
            soldOut: false,

            msgModalVisible: false,
            explorerHash: '',

            addressMintedPresaleBalance: 0,
            addressMintedBalance: 0,
            showErrMsg: false,
            errMsg: '',
            mintDone: true,

            claimMsg: '',
            showClaimMsg: false,
            claimDone: true,
            availableReward: 0,
            action: '',
            rewardContractOwner: '',
            adminModalVisible: false,
            rewardSummary: [],
            isSyncedMsg: '',
            isSynced: true,
            isSyncedChecked: false,
            setNewRootMsg: '',
            setNewRootClicked: false,
            hasClaimed: false,
            canReset: true,
            localMultiplier: 0,
            withdrawAllMsg: '',
            withdrawAllClicked: false,
            rewardContractBalance: 0,
            contractBalanceMsg: '',
            contractBalanceClicked: false,
            rewardToken: '',
            apiUrl: "https://crzmerkle.com/",
            checkCanResetClicked: false,
            switchCanResetClicked: false,
            canResetMsg: '',
            switchCanResetMsg: '',
            decimals: 1000000000000000000
        }

        this.confettiTrigger = null
        this.animationInstance = null
        this.openMintModal = this.openMintModal.bind(this)
        this.closeMintModal = this.closeMintModal.bind(this)
        this.openClaimModal = this.openClaimModal.bind(this)
        this.closeClaimModal = this.closeClaimModal.bind(this)
        this.openAdminModal = this.openAdminModal.bind(this)
        this.closeAdminModal = this.closeAdminModal.bind(this)
        this.toggleFAQ = this.toggleFAQ.bind(this)
        this.checkIfTreeSynced = this.checkIfTreeSynced.bind(this)
        this.setNewRootHash = this.setNewRootHash.bind(this)
    }

    async openMintModal() {
        await this.readContractInfo()
        this.setState({mintModalVisible: true})
    }

    closeMintModal() {
        this.setState({
            mintModalVisible: false,
            errMsg: '',
            showErrMsg: false
        })
    }

    async openClaimModal() {
        await this.readRewardContractInfo()
        await this.readRewardTokenContractInfo()
        await this.getSwitch()
        this.setState({claimModalVisible: true})
    }

    closeClaimModal() {
        this.setState({
            claimModalVisible: false,
            claimMsg: '',
            showClaimMsg: false
        })
    }

    async openAdminModal() {
        await this.readAdminInfo()
        this.setState({adminModalVisible: true})
    }

    closeAdminModal() {
        this.setState({
            adminModalVisible: false,
            isSyncedChecked: false,
            isSyncedMsg: '',
            setNewRootMsg: '',
            setNewRootClicked: false,
            withdrawAllMsg: '',
            withdrawAllClicked: false,
            contractBalanceMsg: '',
            contractBalanceClicked: false,
            canResetMsg: '',
            checkCanResetClicked: false,
            switchCanResetMsg: '',
            switchCanResetClicked: false

        })
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
            msgModalVisible: false,
            action: ''
        })
    }

    goToEtherscan = () => {
        const {explorerHash} = this.state
        window.open(`https://etherscan.io/tx/${explorerHash}`, "_blank")
    }

    handleMint = async (values) => {
        const {address, cost, presaleCost, onlyWhitelisted} = this.state
        console.log('address: ', address)
        if (onlyWhitelisted) {
            fetch(`https://crzmerkle.com/getProof?address=${address.toLowerCase()}`, {
                method: 'GET',
            }).then(async res => {
                let result = await res.json()
                console.log('get proof result: ', address, result)
                if (result.message === 'address not whitelisted') {
                    this.setState({
                        showErrMsg: true,
                        errMsg: `${address} is not whitelisted for presale`
                    })
                } else {
                    // calling pre-sale
                    this.setState({
                        mintDone: false
                    }, async () => {
                        console.log('started')
                        try {
                            // let gasPrice = await this.provider.getGasPrice()
                            // let overrides = {
                            //     value: ethers.utils.parseEther((presaleCost * values.amount).toString()),
                            //     gasPrice: gasPrice
                            // }
                            // let gasLimit = await this.contract.estimateGas.earlyAccessSale(values.amount, result.proof, overrides)


                            let options = {
                                value: ethers.utils.parseEther((presaleCost * values.amount).toString()),
                                // gasLimit: gasLimit,
                                // gasPrice: gasPrice
                            }

                            console.log('presale payload: ', values.amount, result.proof, options)
                            let res = await this.contract.earlyAccessSale(values.amount, result.proof, options)
                            console.log('presale hash: ', res.hash)
                            if (res.hash !== null) {
                                this.setState({
                                    explorerHash: res.hash
                                }, async () => {
                                    let receipt = await res.wait()
                                    console.log('presale receipt: ', receipt)
                                    if (receipt !== null && receipt !== undefined) {
                                        this.setState({
                                            action: 'Mint',
                                            msgModalVisible: true,
                                            mintModalVisible: false,
                                            mintDone: true
                                        })
                                    }
                                })
                            }
                        } catch (err) {
                            console.log('presale call failed: ', err)
                            this.setState({
                                mintDone: true
                            }, () => {
                                if (err.reason !== undefined) {
                                    if (err.reason.includes('insufficient funds for intrinsic transaction cost')) {
                                        this.setState({
                                            showErrMsg: true,
                                            errMsg: 'Not enough funds in your wallet'
                                        })
                                    } else {
                                        this.setState({
                                            showErrMsg: true,
                                            errMsg: err.reason
                                        })
                                    }
                                } else {
                                    this.setState({
                                        showErrMsg: true,
                                        errMsg: err.message
                                    })
                                }
                            })


                        }
                        this.setState({
                            mintDone: true
                        })

                    })
                }
            }).catch(err => {
                console.log('fetch failed: ', err)
            })
        } else {
            this.setState({
                mintDone: false
            }, async () => {
                try {
                    // let gasPrice = await this.provider.getGasPrice()
                    // let overrides = {
                    //     value: ethers.utils.parseEther((cost * values.amount).toString()),
                    //     gasPrice: gasPrice
                    // }
                    // let gasLimit = await this.contract.estimateGas.mint(address, values.amount, overrides)


                    let options = {
                        value: ethers.utils.parseEther((cost * values.amount).toString()),
                        // gasLimit: gasLimit,
                        // gasPrice: gasPrice
                    }

                    console.log('mint payload: ', address, values.amount, options)
                    let res = await this.contract.mint(address, values.amount, options)
                    console.log('mint res: ', res.hash)
                    if (res.hash !== null) {
                        this.setState({
                            explorerHash: res.hash
                        }, async () => {
                            let receipt = await res.wait()
                            console.log('mint receipt: ', receipt)
                            if (receipt !== null && receipt !== undefined) {
                                this.setState({
                                    msgModalVisible: true,
                                    mintModalVisible: false,
                                    mintDone: true
                                })
                            }
                        })

                    }
                } catch (err) {
                    console.log('mint call failed: ', err)
                    this.setState({
                        mintDone: true
                    }, () => {
                        if (err.reason !== undefined) {
                            if (err.reason.includes('insufficient funds for intrinsic transaction cost')) {
                                this.setState({
                                    showErrMsg: true,
                                    errMsg: 'Not enough funds in your wallet'
                                })
                            } else {
                                this.setState({
                                    showErrMsg: true,
                                    errMsg: err.reason
                                })
                            }
                        } else {
                            this.setState({
                                showErrMsg: true,
                                errMsg: err.message
                            })
                        }
                    })

                }
            })
        }
    }

    handleClaimReward = async () => {
        const {address, availableReward, canReset, hasClaimed} = this.state
        console.log('address: ', address, availableReward)
        if (hasClaimed && canReset) {
            this.setState({
                resetDone: false
            }, async () => {
                console.log('start reset')
                try {
                    let res = await this.rewardContract.resetClaimed()
                    console.log('reset hash: ', res.hash)
                    if (res.hash !== null) {
                        this.setState({
                            explorerHash: res.hash
                        }, async () => {
                            let receipt = await res.wait()
                            console.log('reset receipt: ', receipt)
                            if (receipt !== null && receipt !== undefined) {
                                let hasClaimed = await this.rewardContract.hasClaimed()
                                this.setState({
                                    resetDone: true,
                                    hasClaimed
                                })
                            }
                        })
                    }
                } catch(err) {
                    console.log('reset failed: ', err)
                }
            })

        } else {
            fetch(`${this.state.apiUrl}getProof?address=${address.toLowerCase()}&amount=${availableReward}`, {
                method: 'GET',
            }).then(async res => {
                let result = await res.json()
                console.log('get claim proof result: ', address, result)
                if (result.message === 'address not rewardListed or invalid claim amount') {
                    this.setState({
                        showErrMsg: true,
                        errMsg: `${address} is not rewardListed or invalid claim amount`
                    })
                } else {
                    // calling pre-sale
                    this.setState({
                        claimDone: false
                    }, async () => {
                        console.log('started claim')
                        try {
                            console.log('claim payload: ',  this.rewardTokenContract.address, Math.floor(availableReward * this.state.localMultiplier))
                            let res = await this.rewardContract.claimTokens(this.rewardTokenContract.address, Math.floor(availableReward * this.state.localMultiplier), result.proof)
                            console.log('claim hash: ', res.hash)
                            if (res.hash !== null) {
                                this.setState({
                                    explorerHash: res.hash
                                }, async () => {
                                    let receipt = await res.wait()
                                    console.log('claim receipt: ', receipt)
                                    if (receipt !== null && receipt !== undefined) {
                                        this.setState({
                                            action: 'Claim',
                                            msgModalVisible: true,
                                            claimModalVisible: false,
                                            claimDone: true
                                        })
                                    }
                                })
                            }
                        } catch (err) {
                            console.log('claim reward failed: ', err)
                            this.setState({
                                claimDone: true
                            }, () => {
                                if (err.reason !== undefined) {
                                    if (err.reason.includes('insufficient funds for intrinsic transaction cost')) {
                                        this.setState({
                                            showErrMsg: true,
                                            errMsg: 'Not enough funds in your wallet'
                                        })
                                    } else {
                                        this.setState({
                                            showErrMsg: true,
                                            errMsg: err.reason
                                        })
                                    }
                                } else {
                                    this.setState({
                                        showErrMsg: true,
                                        errMsg: err.message
                                    })
                                }
                            })


                        }
                        this.setState({
                            claimDone: true
                        })

                    })
                }
            }).catch(err => {
                console.log('claim fetch failed: ', err)
            })
        }

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

            this.provider = ethers.getDefaultProvider(this.state.networkId)
            // this.contract = new ethers.Contract(Contract.address, Contract.abi, this.provider)
            this.signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
            this.contract = new ethers.Contract(Contract.address, Contract.abi, this.signer)
            this.rewardContract= new ethers.Contract(RewardContract.address, RewardContract.abi, this.signer)
            this.rewardTokenContract = new ethers.Contract(RewardTokenContract.address, RewardTokenContract.abi, this.signer)

            this.setState({
                startWatch: true
            }, async () => {
                await this.readContractInfo()
                await this.readRewardContractInfo()
                await this.readRewardTokenContractInfo()
            })
        }
    }

    readContractInfo = async () => {
        const { address } = this.state
        try {
            let maxSupply = await this.contract.maxSupply()

            let maxPresaleSupply = await this.contract.maxPresaleSupply()

            let maxMintAmount = await this.contract.maxMintAmount()

            let nftPerAddressLimit = await this.contract.nftPerAddressLimit()

            let nftPerAddressPresaleLimit = await this.contract.nftPerAddressPresaleLimit()

            let onlyWhitelisted = await this.contract.onlyWhitelisted()

            let paused = await this.contract.paused()

            let cost = await this.contract.cost()

            let presaleCost = await this.contract.presaleCost()

            let availableAmount = await this.contract.availableAmount()

            let availablePresaleAmount = await this.contract.availablePresaleAmount()

            let owner = await this.contract.owner()

            let addressMintedBalance = await this.contract.addressMintedBalance(address)

            let addressMintedPresaleBalance = await this.contract.addressMintedPresaleBalance(address)

            this.setState({
                maxSupply: ethers.BigNumber.from(maxSupply).toNumber(),
                maxPresaleSupply: ethers.BigNumber.from(maxPresaleSupply).toNumber(),
                maxMintAmount: ethers.BigNumber.from(maxMintAmount).toNumber(),
                nftPerAddressLimit: ethers.BigNumber.from(nftPerAddressLimit).toNumber(),
                nftPerAddressPresaleLimit: ethers.BigNumber.from(nftPerAddressPresaleLimit).toNumber(),
                cost: Number(ethers.utils.formatEther(cost)),
                presaleCost: Number(ethers.utils.formatEther(presaleCost)),
                availableAmount: ethers.BigNumber.from(availableAmount).toNumber(),
                availablePresaleAmount: ethers.BigNumber.from(availablePresaleAmount).toNumber(),
                addressMintedPresaleBalance: ethers.BigNumber.from(addressMintedPresaleBalance).toNumber(),
                addressMintedBalance: ethers.BigNumber.from(addressMintedBalance).toNumber(),
                paused,
                isWhitelisted: false,
                onlyWhitelisted, owner,
                soldOut: ethers.BigNumber.from(availableAmount).toNumber() === 0,
                loading: false
            }, () => {
                const { availableAmount, availablePresaleAmount, nftPerAddressLimit, nftPerAddressPresaleLimit, maxMintAmount, onlyWhitelisted, owner, addressMintedBalance, addressMintedPresaleBalance, address } = this.state
                console.log('limit: ', onlyWhitelisted, nftPerAddressPresaleLimit, nftPerAddressLimit, addressMintedBalance, this.sameAddress(owner, address))
                this.validationSchema = yup.object().shape({
                    amount: yup
                        .number()
                        .required('Mint amount is required')
                        .positive('Mint amount has to be positive')
                        .integer('Mint amount has to be an integer')
                        .test({
                            name: 'checkSufficientAmount',
                            message: `Current address available minting limit: ${onlyWhitelisted ? nftPerAddressPresaleLimit - addressMintedPresaleBalance : nftPerAddressLimit - addressMintedBalance} `
                           + '\n' + `Available NFT for current stage: ${onlyWhitelisted ? availablePresaleAmount : availableAmount}`,
                            test: (amount) => {
                                let test1 = this.sameAddress(owner, address) || (onlyWhitelisted && amount <= availablePresaleAmount) || (!onlyWhitelisted && amount <= availableAmount)
                                let test2 = this.sameAddress(owner, address) || (!this.sameAddress(owner, address) && ((onlyWhitelisted && amount + addressMintedPresaleBalance <= nftPerAddressPresaleLimit) || (!onlyWhitelisted && amount + addressMintedBalance <= Math.min(nftPerAddressLimit, maxMintAmount))))
                                let test3 = amount <= maxMintAmount
                                return test1 && test2 && test3
                            }
                        })
                })
            })
        } catch (err) {
            console.log('read contract info error: ', err)
        }
    }

    readRewardContractInfo = async () => {
        const { address } = this.state
        this.getRewards().then(() => {
            const { availableReward } = this.state
            console.log('reward: ', availableReward)
        })
        let hasClaimed = await this.rewardContract.hasClaimed(address)
        let canReset = await this.rewardContract.canReset()
        let rewardContractOwner = await this.rewardContract.owner()
        let localMultiplier = await this.rewardContract.localMultiplier()
        let rewardContractBalance = parseFloat(ethers.BigNumber.from(await this.rewardContract.checkRewardBalance(this.rewardTokenContract.address, this.rewardContract.address)).toString()) / this.state.decimals
        console.log('rewardContract Info: ', hasClaimed, canReset, rewardContractOwner, rewardContractBalance, typeof rewardContractBalance)
        this.setState({
            canReset, hasClaimed, rewardContractOwner, localMultiplier, rewardContractBalance
        })
    }

    readRewardTokenContractInfo = async () => {
        let rewardToken = await this.rewardTokenContract.symbol()
        console.log('rewardToken: ', rewardToken)
        this.setState({
            rewardToken
        })
    }

    getSwitch = async () => {
        fetch(`${this.state.apiUrl}getSwitch`, {
            method: 'GET',
        }).then(async res => {
            let result = await res.json()
            console.log('switch status: ', result)
            this.setState({
                dbUpdating: result.updating
            })
        }).catch(err => {
            console.log('get switch failed: ', err)
            this.setState({
                dbUpdating: true
            })
        })
    }

    readAdminInfo = async () => {
        fetch(`${this.state.apiUrl}getSummary`, {
            method: 'GET',
        }).then(async res => {
            let result = await res.json()
            let dataList = result.data.map(item => {
                return {
                    addr: item.addr,
                    amount: item.amount / this.state.localMultiplier,
                    nftOwned: item.nftOwned
                }
            })
            if (res.status === 200) {
                this.setState({
                    rewardSummary: dataList
                })
            }
        })
    }

    getRewards = async () => {
        const { address } = this.state
        console.log('address: ', address)
        fetch(`${this.state.apiUrl}getOwnerRewardFromDB?address=${address.toLowerCase()}`, {
            method: 'GET',
        }).then(async res => {
            let result = await res.json()
            console.log('here is reward: ', result)
            if (res.status === 200) {
                if (result.data.msg === 'address not found') {
                    this.setState({
                        availableReward: 0
                    })
                } else {
                    this.setState({
                        availableReward: result.data.reward / 10000
                    })
                }

            }
        })
    }

    sameAddress = (addr1, addr2) => {
        return addr1.toLowerCase() === addr2.toLowerCase();

    }

    checkIfTreeSynced = () => {
        this.setState({
            isSyncedChecked: true
        })
        fetch(`${this.state.apiUrl}getRootHash`, {
            method: 'GET',
        }).then(async res => {
            let result = await res.json()
            let contractRootHash = await this.rewardContract.merkleRoot()
            let isSynced = result.hash.toLowerCase() === contractRootHash.toLowerCase()
            console.log('isSynced: ', isSynced)
            if (res.status === 200) {
                this.setState({
                    currentRoothash: result.hash,
                    isSynced,
                    isSyncedMsg: isSynced ? 'Tree is synced' : 'Tree is not synced !, You should update tree root',
                })
            }
        })
    }

    setNewRootHash = () => {
        fetch(`${this.state.apiUrl}getRootHash`, {
            method: 'GET',
        }).then(async res => {
            let result = await res.json()
            if (this.state.currentRoothash !== '') {
                console.log('updating: ', result.hash)
                let res = await this.rewardContract.setMerkleRoot(result.hash)
                this.setState({
                    setNewRootClicked: true
                })
                if (res.hash !== null) {
                    let receipt = await res.wait()
                    if (receipt !== null && receipt !== undefined) {
                        this.setState({
                            setNewRootMsg: 'Root Hash Updated in Contract'
                        })
                    }
                }
            }
        })
    }

    checkContractBalance = async () => {
        let balance = parseFloat(ethers.BigNumber.from(await this.rewardContract.checkRewardBalance(this.rewardTokenContract.address, this.rewardContract.address)).toString()) / this.state.decimals
        this.setState({
            rewardContractBalance: balance,
            contractBalanceMsg: `Current Balance: ${balance.toString()} ${this.state.rewardToken}`,
            contractBalanceClicked: true
        })
    }

    withdrawAll = async () => {
        let balance = ethers.BigNumber.from(await this.rewardContract.checkRewardBalance(this.rewardTokenContract.address, this.rewardContract.address)).toString()
        let res = await this.rewardContract.withdrawToken(this.rewardTokenContract.address, balance)
        if (res.hash !== null) {
            let receipt = await res.wait()
            if (receipt !== null && receipt !== undefined) {
                this.setState({
                    withdrawAllMsg: 'Withdraw all tokens requested',
                    withdrawAllClicked: true
                })
            }
        }
    }

    checkReset = async () => {
        let canReset = await this.rewardContract.canReset()
        console.log('this is canReset: ', canReset)
        this.setState({
            canResetMsg: `canReset status: ${canReset}`,
            checkCanResetClicked: true
        })
    }

    switchCanReset = async () => {
        let canReset = await this.rewardContract.canReset()
        let res = await this.rewardContract.setCanReset(!canReset)
        if (res.hash !== null) {
            let receipt = await res.wait()
            if (receipt !== null && receipt !== undefined) {
                let canReset = await this.rewardContract.canReset()
                this.setState({
                    switchCanResetMsg: 'canReset updated',
                    switchCanResetClicked: true,
                    canReset
                })
            }
        }
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

    render() {
        const {
            loading,
            maxSupply,
            maxMintAmount,
            availableAmount,
            cost,
            presaleCost,
            paused,
            nftPerAddressLimit,
            nftPerAddressPresaleLimit,
            isWhitelisted,
            onlyWhitelisted,
            address,
            owner,
            soldOut,
            amount,
            mintDone
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
                            <h2>EARN $APECOIN PASSIVELY SOON</h2>
                            <h1 className={'logo'}>CRYPTO <br/> CHiMPZ</h1>
                            <div style={{marginTop: 70, marginBottom: 70}}  className={'row gx-3 links'}>
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
                                <div className="col-12" style={{ marginTop: 20 }}>
                                    <Button as={'a'} href={'https://opensea.io/collection/cryptochimpz-nft'} target={'_blank'}
                                            variant={'opensea'} className={'rounded-pill'}>
                                        <img alt={'opensea image'} src={openSea} style={{ width: 20, height: 20, marginRight: 8 }} />
                                        Opensea
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Divider className={'divider'}/>
                </div>
                <div className="wrapper mint">
                    <div className="container">
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                            <Button size={"lg"}
                                    onClick={() => window.ethereum ? this.openMintModal() : onBoard.startOnboarding()}
                                    disabled={!mintDone}
                                    style={{ marginBottom: isMobile ? '15px' : null }}
                            >
                                <FontAwesomeIcon icon={['fas', 'coins']}/>
                                MiNT NOW!!!
                            </Button>
                            <Countdown
                                date={new Date('2022-05-31T20:00:00-05:00')}
                                prepend={<h2 style={{fontFamily: "'Space Mono', sans-serif", fontSize: "30px", textTransform: 'uppercase'}}>
                                    REWARD CLAIMING STARTS IN
                                </h2>}
                            >
                                <Button size={"lg"}
                                        onClick={() => window.ethereum ? this.openClaimModal() : onBoard.startOnboarding()}
                                        disabled={!mintDone}
                                        style={{ backgroundColor: '#e8bf15', borderColor: '#e8bf15', marginBottom: isMobile ? '15px' : null }}
                                >
                                    <FontAwesomeIcon icon={['fas', 'coins']}/>
                                    CLAIM REWARDS
                                </Button>
                            </Countdown>

                            {
                                this.state.address.toLowerCase() === this.state.rewardContractOwner.toLowerCase() ?
                                    <Button size={"lg"}
                                            onClick={() => window.ethereum ? this.openAdminModal() : onBoard.startOnboarding()}
                                            disabled={!mintDone}
                                            style={{ backgroundColor: '#c13584', borderColor: '#c13584' }}
                                    >
                                        <FontAwesomeIcon icon={['fas', 'coins']}/>
                                        ADMIN
                                    </Button>
                                : null
                            }
                        </div>
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
                                    ahead is bumpy, but fruitful! The CryptoChimpz were forced into turmoil and 5,000
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
                                        ChimpWives to the rescue! 5,000 ChimpWives have come to the help of their
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
                            <h3>$APE COIN CLAIMS</h3>
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
                            {`${this.state.action} Requested`} <br/><br/>
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
                                // : !this.sameAddress(owner, address) && (this.state.onlyWhitelisted && !this.state.isWhitelisted) ?
                                //     <div className="status">
                                //         <FontAwesomeIcon icon={'hourglass-half'}/>
                                //         <div className={'message'}>Your address is not registered for pre-sale. Public sale
                                //             will start soon!
                                //         </div>
                                //     </div>
                                :
                                <>
                                    <Formik
                                        initialValues={{amount: ''}}
                                        validationSchema={this.validationSchema}
                                        onSubmit={async (values, {setSubmitting, resetForm}) => {
                                            setSubmitting(true)
                                            setTimeout(async () => {
                                                await this.handleMint(values)
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

                                                    <Typography
                                                        style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>
                                                        {'Estimated Cost:'}
                                                    </Typography>

                                                    <Typography
                                                        style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>
                                                        {`${values.amount === '' ? '--' : onlyWhitelisted ? presaleCost * parseFloat(values.amount) : cost * parseFloat(values.amount)} ETH`}
                                                    </Typography>
                                                    {/*<p style={{ marginTop: 15, fontSize: 12, fontWeight: 'light', color: '#989898', fontStyle: 'italic' }}>*/}
                                                    {/*    Pre-sale Limit:<span style={{ color: 'white', fontStyle: 'normal', fontWeight: 'bold', fontSize: 14, marginRight: 20 }}>  {nftPerAddressPresaleLimit}</span>*/}
                                                    {/*    Public Sale Limit: <span style={{ color: 'white', fontStyle: 'normal', fontWeight: 'bold', fontSize: 14, marginRight: 20 }}>{nftPerAddressLimit}</span>*/}
                                                    {/*    Max per address:<span style={{ color: 'white', fontStyle: 'normal', fontWeight: 'bold', fontSize: 14, marginRight: 20 }}>  {nftPerAddressPresaleLimit + nftPerAddressLimit}</span>*/}
                                                    {/*</p>*/}
                                                    <Form.Group controlId={'formAmount'} className={'col-12'}>
                                                        <Form.Label>Amount</Form.Label>
                                                        <InputGroup
                                                            size={'lg'}
                                                            className={ClassNames([{'is-invalid': errors.amount}])}
                                                        >
                                                            <Button variant={'outline-secondary'} onClick={() => {
                                                                    setFieldValue('amount', --values.amount)
                                                                    setFieldTouched('amount')
                                                                }}
                                                                disabled={!mintDone}
                                                            >
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
                                                                disabled={!mintDone}
                                                            />
                                                            <Button variant={'outline-secondary'} onClick={() => {
                                                                    setFieldValue('amount', ++values.amount)
                                                                    setFieldTouched('amount')
                                                                }}
                                                                    disabled={!mintDone}

                                                            >
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
                                                                disabled={isSubmitting || !mintDone}>
                                                            {isSubmitting &&
                                                                <FontAwesomeIcon icon={'spinner-third'} spin/>}
                                                            MiNT
                                                        </Button>
                                                        {
                                                            this.state.showErrMsg ?
                                                                <p style={{ display: 'flex', justifyContent: 'center' }}>{this.state.errMsg}</p> : null
                                                        }
                                                    </div>
                                                </Form>
                                            )
                                        }
                                    </Formik>
                                </>
                    }

                </Modal>


                <Modal
                    width="400px" title={'CURRENT CLAIM BALANCE'}
                    visible={this.state.claimModalVisible}
                    onClose={this.closeClaimModal}
                >
                    {
                        this.state.dbUpdating ?
                            <div className="status">
                                <FontAwesomeIcon icon={'spinner-third'} spin/>
                                <div className="message">
                                    Updating rewards, please try again later
                                </div>
                            </div> :
                                this.state.hasClaimed && !this.state.canReset ?
                                    <div className="status">
                                        <FontAwesomeIcon icon={'spinner-third'} spin/>
                                        <div className="message">
                                            You have already claimed your reward.
                                            Please wait for next round of reward to be distributed
                                        </div>
                                    </div> :
                                        this.state.availableReward === 0 ?
                                            <div className="status">
                                                <FontAwesomeIcon icon={'spinner-third'} spin/>
                                                <div className="message">
                                                    No available rewards to claim
                                                </div>
                                            </div>
                                            :
                                            <>
                                                <Formik
                                                    initialValues={{amount: this.state.availableReward, token: this.state.rewardToken}}
                                                    onSubmit={async (values, {setSubmitting, resetForm}) => {
                                                        setSubmitting(true)
                                                        setTimeout(async () => {
                                                            await this.handleClaimReward(values)
                                                            resetForm()
                                                            setSubmitting(false)
                                                        }, 1000)
                                                    }}
                                                >
                                                    {
                                                        ({
                                                             values,
                                                             errors,
                                                             handleSubmit,
                                                             isSubmitting,
                                                         }) => (
                                                            <Form onSubmit={handleSubmit} className={'row g-3'}>
                                                                <Form.Group controlId={'formAmount'} className={'col-12'}>
                                                                    <Form.Label>{`$${values.token} available to claim !`}</Form.Label>
                                                                    <Form.Label>{`The following balance can be withdrawn now or it can be accumulated and withdrawn at a later time.`}</Form.Label>
                                                                    <InputGroup
                                                                        size={'lg'}
                                                                        className={ClassNames([{'is-invalid': errors.amount}])}
                                                                    >
                                                                        <Form.Control
                                                                            type={'number'} placeholder={'Enter amount'}
                                                                            name={'amount'} value={values.amount}
                                                                            className={ClassNames(['text-center', {'is-invalid': errors.amount}])}
                                                                            style={{ backgroundColor: 'black' }}
                                                                            autoComplete={'off'}
                                                                            disabled={true}
                                                                        />
                                                                    </InputGroup>
                                                                </Form.Group>
                                                                <div className="col-12 text-end">
                                                                    <Button className={'mint-btn w-100'} variant={'primary'}
                                                                            type={'submit'}
                                                                            disabled={isSubmitting}>
                                                                        {isSubmitting &&
                                                                        <FontAwesomeIcon icon={'spinner-third'} spin/>}
                                                                        {this.state.hasClaimed ? `ACTIVATE TO WITHDRAW` : `WITHDRAW`}
                                                                    </Button>
                                                                    {
                                                                        this.state.showClaimMsg ?
                                                                            <p style={{ display: 'flex', justifyContent: 'center' }}>{this.state.claimMsg}</p> : null
                                                                    }
                                                                </div>
                                                            </Form>
                                                        )
                                                    }
                                                </Formik>
                                            </>
                    }
                </Modal>

                <Modal
                    width="800px" title={'Admin Information'}
                    visible={this.state.adminModalVisible}
                    onClose={this.closeAdminModal}
                >
                    <div>
                        <Table listData={this.state.rewardSummary}/>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        <div className="text-end">
                            <Button
                                className={'mint-btn w-80'}
                                variant={'primary'}
                                type={'submit'}
                                onClick={this.checkIfTreeSynced}
                            >
                                {`Check Sync`}
                            </Button>
                            {
                                this.state.isSyncedChecked ?
                                    <p style={{ display: 'flex', justifyContent: 'center', color: !this.state.isSynced ? 'red' : 'green' }}>{this.state.isSyncedMsg}</p> : null
                            }
                        </div>
                        <div className="text-end">
                            <Button
                                className={'mint-btn w-80'}
                                variant={'primary'}
                                type={'submit'}
                                onClick={this.setNewRootHash}
                                disabled={this.state.isSynced}
                            >
                                {`Set New Root Hash`}
                            </Button>
                            {
                                this.state.setNewRootClicked ?
                                    <p style={{ display: 'flex', justifyContent: 'center', color: 'green' }}>{this.state.setNewRootMsg}</p> : null
                            }
                        </div>
                        <div className="text-end">
                            <Button
                                className={'mint-btn w-80'}
                                variant={'primary'}
                                type={'submit'}
                                onClick={this.checkContractBalance}
                            >
                                {`Check Contract Balance`}
                            </Button>
                            {
                                this.state.contractBalanceClicked ?
                                    <p style={{ display: 'flex', justifyContent: 'center', color: 'green' }}>{this.state.contractBalanceMsg}</p> : null
                            }
                        </div>
                        <div className="text-end">
                            <Button
                                className={'mint-btn w-80'}
                                variant={'primary'}
                                type={'submit'}
                                onClick={this.withdrawAll}
                                disabled={this.state.rewardContractBalance === 0}
                            >
                                {`Withdraw All`}
                            </Button>
                            {
                                this.state.withdrawAllClicked ?
                                    <p style={{ display: 'flex', justifyContent: 'center', color: 'green' }}>{this.state.withdrawAllMsg}</p> : null
                            }
                        </div>
                        <div className="text-end">
                            <Button
                                className={'mint-btn w-80'}
                                variant={'primary'}
                                type={'submit'}
                                onClick={this.checkReset}
                            >
                                {`Check Reset`}
                            </Button>
                            {
                                this.state.checkCanResetClicked ?
                                    <p style={{ display: 'flex', justifyContent: 'center', color: 'green' }}>{this.state.canResetMsg}</p> : null
                            }
                        </div>
                        <div className="text-end">
                            <Button
                                className={'mint-btn w-80'}
                                variant={'primary'}
                                type={'submit'}
                                onClick={this.switchCanReset}
                            >
                                {`Switch canReset`}
                            </Button>
                            {
                                this.state.switchCanResetClicked ?
                                    <p style={{ display: 'flex', justifyContent: 'center', color: 'green' }}>{this.state.switchCanResetMsg}</p> : null
                            }
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
}

export default HomePage;
