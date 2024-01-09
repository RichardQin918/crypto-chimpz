const express = require('express')
const { MerkleTree } = require('merkletreejs');
const { bufferToHex } = require('ethereumjs-util');
const keccak256 = require('keccak256');
const url = require('url');
const cors = require("cors");
const SHA256 = require('crypto-js/sha256')
const { soliditySha3 } = require('web3-utils')
const Web3 = require("web3");
const axios = require('axios')
const Moralis = require("moralis/node");
const app = express();
app.use(cors())
const web3 = new Web3()

let rewardList = [
    {addr: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", amount: web3.eth.abi.encodeParameter("uint256", "20")},
    {addr: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", amount: web3.eth.abi.encodeParameter("uint256", "20")},
]

let allLower = rewardList.map(item => {
    return {addr: item.addr.toLowerCase(), amount: item.amount}
})
let leafNodes = allLower.map(item => keccak256(
    Buffer.concat([
      Buffer.from(item.addr.replace("0x", ""), "hex"),
      Buffer.from(item.amount.replace("0x", ""), "hex"),
    ])
  ))
let merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
const nftContractAddress = '0xe12B365d3F7c774e59A93f91209BE9a5BF2bBe34'
const rewardContractAddress = '0xcFE3456e0df2340c21f7D7a9C2c09b9c25473cbb'
const nullAddress = '0x0000000000000000000000000000000000000000'
const etherscanAPIKey = 'ME2H9C99URN461PF3QKDQ517AY4GP1FXHW'
const rewardPerNft = 20
function getRootHash() {
    const rootHash = merkleTree.getRoot()
    let bytes32 = bufferToHex(rootHash)
    // console.log('Whitelist Merkle Tree\n', merkleTree.toString())
    console.log('rootHash: ', bytes32)
    return bytes32
}

function getProof(addr, amount) {
    let index = allLower.findIndex(item => item.addr === addr && item.amount === web3.eth.abi.encodeParameter("uint256", amount));
    console.log('index: ', index)
    const hexProof = merkleTree.getHexProof(leafNodes[index])
    console.log('hexProof: ', hexProof, typeof hexProof)
    return hexProof
}

async function getMinters() {
    try {
        const options = {
            method: "GET",
            url: "https://api-rinkeby.etherscan.io/api",
            params: {
                module: "account",
                action: "tokennfttx",
                contractaddress: nftAddress,
                address: nullAddress,
                page: "1",
                offset: "100",
                startblock: "0",
                endblock: "14749287",
                sort: "desc",
                apikey: etherscanAPIKey,
            },
        };

        const { data } = await axios.request(options);
        return data.result;
    } catch (error) {
        console.log(error);
        return [];
    }
};

function updateTree(givenList) {
    allLower = givenList.map(item => {
        return {addr: item.addr.toLowerCase(), amount: item.amount}
    })
    leafNodes= allLower.map(item => keccak256(
        Buffer.concat([
            Buffer.from(item.addr.replace("0x", ""), "hex"),
            Buffer.from(item.amount.replace("0x", ""), "hex"),
        ])
    ))
    // console.log('leafNodes: ', leafNodes)
    merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
    let newHash = getRootHash()
    return newHash
}

async function getOwners() {
    const options = {
        address: nftContractAddress,
        chain: "rinkeby",
    };
    const nftOwners = await Moralis.Web3API.token.getNFTOwners(options);
    return nftOwners.result
}

function arrangeSummary(owners) {
    let ownerMap = {}
    let newList = []
    for (let i = 0; i < owners.length; i++) {
        if (ownerMap[owners[i]['owner_of']] === undefined) {
            ownerMap[owners[i]['owner_of']] = 1
        } else {
            ownerMap[owners[i]['owner_of']]++
        }
    }
    for (const key in ownerMap) {
        newList.push({addr: key, amount: web3.eth.abi.encodeParameter("uint256", (ownerMap[key] * rewardPerNft).toString())})
    }
    return newList
}

app.get('/getRootHash', (req, res) => {
    let result = getRootHash()
    res.status(200).json({
        hash: result
    })
})

app.get('/getProof', (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    try {
        let result = getProof(queryObject.address.toLowerCase(), parseFloat(queryObject.amount))
        res.status(200).json({
            proof: result
        })
    } catch(err) {
        console.log('get proof failed: ', err)
        res.status(400).json({
            message: 'address not rewardListed'
        })
    }

})

app.get('/getOwners', async (req, res) => {
    try {
        let ownerList = await getOwners()
        let newList = arrangeSummary(ownerList)
        newList = newList.map(item => {
            return {
                addr: item.addr,
                amount: web3.eth.abi.decodeParameter('uint256', item.amount)
            }
        })
        res.status(200).json({
            summary: newList
        })
    } catch(err) {
        console.log('get owners failed: ', err)
        res.status(400).json({
            message: err
        })
    }

})

app.get('/updateMerkle', async (req, res) => {
    try {
        let ownerList = await getOwners()
        let newList = arrangeSummary(ownerList)
        let newHash = updateTree(newList)
        console.log('new rootHash: ', newHash)
        res.status(200).json({
            hash: newHash
        })
    } catch(err) {
        console.log('update merkle failed: ', err)
        res.status(400).json({
            message: err
        })
    }
})

app.get('/availableReward', async (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    let obj = rewardList.find(item => item.addr.toLowerCase() === queryObject.address.toLowerCase());
    if (obj !== undefined && obj.amount !== undefined) {
        let amount = await web3.eth.abi.decodeParameter('uint256', obj.amount)
        res.status(200).json({
            amount: amount
        })
    } else {
        res.status(400).json({
            message: 'address not found'
        })
    }

})

module.exports = app;
