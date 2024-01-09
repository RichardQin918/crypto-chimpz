// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract ChimpzReward is Ownable {
    bytes32 public merkleRoot;

    mapping(address=>bool) private claimed;

    event MerkleRootChanged(bytes32 merkleRoot);
    event Claim(address indexed claimant, uint256 amount);
    uint256 public multiplier = 100000000000000;
    uint256 public localMultiplier = 10000;
    bool public canReset = false;

    /**
     * @dev Constructor.
     */
    constructor(){}

    /**
     * @dev Claims reward tokens.
     * @param amount The amount of the claim being made.
     * @param merkleProof A merkle proof proving the claim is valid.
     */
    function claimTokens(IERC20 _token, uint256 amount, bytes32[] calldata merkleProof) public {
        uint256 erc20balance = _token.balanceOf(address(this));
        require(amount * multiplier <= erc20balance, "balance is low");
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        bool valid = MerkleProof.verify(merkleProof, merkleRoot, leaf);
        require(valid, "Chimpz: Valid proof required.");
        require(!claimed[msg.sender], "Chimpz: Tokens already claimed.");
        claimed[msg.sender] = true;
    
        emit Claim(msg.sender, amount * multiplier);
        _token.transfer(msg.sender, amount * multiplier);
    }

    function resetClaimed() public {
        require(canReset, "Can not reset at this moment");
        claimed[msg.sender] = false;
    }

    /**
     * @dev Returns true if the claim at the given index in the merkle tree has already been made.
     * @param account The address to check if claimed.
     */
    function hasClaimed(address account) public view returns (bool) {
        return claimed[account];
    }

    /**
     * @dev Sets the merkle root. Only callable if the root is not yet set.
     * @param _merkleRoot The merkle root to set.
     */
    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootChanged(_merkleRoot);
    }

    function checkRewardBalance(IERC20 _token, address account) public view returns (uint256) {
        return _token.balanceOf(account);
    }

    function setMultiplier(uint newMultipler) public onlyOwner {
        multiplier = newMultipler;
    }

    function setLocalMultiplier(uint newLocalMultiplier) public onlyOwner {
        localMultiplier = newLocalMultiplier;
    }

    function setCanReset(bool newCanReset) public onlyOwner {
        canReset = newCanReset;
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    function withdrawToken(address _tokenContract, uint256 _amount) public onlyOwner {
        IERC20 tokenContract = IERC20(_tokenContract);
        
        // transfer the token from address of this contract
        // to address of the user (executing the withdrawToken() function)
        tokenContract.transfer(msg.sender, _amount);
    }
}