const { MerkleTree } = require('merkletreejs');
const { bufferToHex, from } = require('ethereumjs-util');
const keccak256 = require('keccak256');
import * as whiteList from "../config/WhiteListedAddresses.json"

const leafNodes = whiteList.addresses.map(addr => keccak256(addr))
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
console.log('leafNodes: ', leafNodes[0])

export function getRootHash() {
    const rootHash = merkleTree.getRoot()
    let bytes32 = bufferToHex(rootHash)
    console.log('Whitelist Merkle Tree\n', merkleTree.toString())
    console.log('rootHash: ', bytes32)
    return bytes32
}

export function getProof(address) {
    let index = whiteList.addresses.findIndex(address)
    let hexProof = merkleTree.getHexProof(leafNodes[index])
    let proof = keccakFromHexString(hexProof)
    console.log('hexProof: ', hexProof)
    return proof
}

