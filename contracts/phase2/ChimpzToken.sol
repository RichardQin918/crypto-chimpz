// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Lock.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract ChimpzToken is ERC20, ERC20Permit, Ownable {
    bytes32 public merkleRoot;

    mapping(address=>bool) private claimed;

    event MerkleRootChanged(bytes32 merkleRoot);
    event Claim(address indexed claimant, uint256 amount);

    // total supply 1 trillion, 80% airdrop, 20% devs vested
    uint256 constant airdropSupply = 800_000_000_000e18;
    uint256 constant devSupply = 200_000_000_000e18;

    bool public vestStarted = false;

    uint256 public constant claimPeriodEnds = 1683136209; // may 3, 2023

    /**
     * @dev Constructor.
     */
    constructor(
    )
        ERC20("PoutineToken", "POTT")
        ERC20Permit("PoutineToken")
    {
        _mint(address(this), airdropSupply);
    }

    function startVest(address tokenLockAddress) public onlyOwner {
        require(!vestStarted, "Chimpz: Vest has already started.");
        vestStarted = true;
        _approve(address(this), tokenLockAddress, devSupply);
        Lock(tokenLockAddress).lock(0x1bc9BB48C8DEa11a5Ba921cfDA34FEf2aFF8E92d, 200_000_000_000e18);
    }

    /**
     * @dev Claims airdropped tokens.
     * @param amount The amount of the claim being made.
     * @param merkleProof A merkle proof proving the claim is valid.
     */
    function claimTokens(uint256 amount, bytes32[] calldata merkleProof) public {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        bool valid = MerkleProof.verify(merkleProof, merkleRoot, leaf);
        require(valid, "Chimpz: Valid proof required.");
        require(!claimed[msg.sender], "Chimpz: Tokens already claimed.");
        claimed[msg.sender] = true;
    
        emit Claim(msg.sender, amount);

        _transfer(address(this), msg.sender, amount);
    }

    /**
     * @dev Allows the owner to sweep unclaimed tokens after the claim period ends.
     * @param dest The address to sweep the tokens to.
     */
    function sweep(address dest) public onlyOwner {
        require(block.timestamp > claimPeriodEnds, "Chimpz: Claim period not yet ended");
        _transfer(address(this), dest, balanceOf(address(this)));
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

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20)
    {
        super._burn(account, amount);
    }
}