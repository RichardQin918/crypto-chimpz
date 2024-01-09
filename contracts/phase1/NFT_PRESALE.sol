// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";


contract CRYPTOCHIMPZ is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string public baseURI;
    string public baseExtension = ".json";
    string public notRevealedUri;

    uint256 public presaleCost = 0.069 ether;
    uint256 public cost = 0.09 ether;

    uint256 public maxPresaleSupply = 2000;
    uint256 public maxSupply = 10000;

    uint256 public nftPerAddressPresaleLimit = 2;
    uint256 public nftPerAddressLimit = 6;

    uint256 public availablePresaleAmount = 2000;
    uint256 public availableAmount = 10000;

    uint256 public maxMintAmount = 8;

    bool public paused = false;
    bool public revealed = false;
    bool public onlyWhitelisted = true;
    mapping(address => uint256) public addressMintedBalance;
    mapping(address => uint256) public addressMintedPresaleBalance;
    address constant private marketingAddress = 0x42d90831bcdD86e8C0dF27ffC96D0f3eC9b1F599;
    bytes32 public merkleRoot;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initBaseURI,
        string memory _initNotRevealedUri,
        bytes32 _merkleRoot
    ) ERC721(_name, _symbol) {
        setBaseURI(_initBaseURI);
        setNotRevealedURI(_initNotRevealedUri);
        mint(marketingAddress, 50);
        merkleRoot = _merkleRoot;
    }

    // internal
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function earlyAccessSale(
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external payable {
        uint256 supply = totalSupply();
        uint256 ownerMintedCount = addressMintedPresaleBalance[msg.sender];

        require(onlyWhitelisted, "The presale has ended");
        require(supply + amount <= maxPresaleSupply, "max NFT presale limit exceeded");
        require(ownerMintedCount + amount <= nftPerAddressPresaleLimit, "max NFT presale per address limit exceeded");
        require(msg.value == presaleCost * amount, "Presale: Incorrect payment");
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "MerkleDistributor: Invalid proof."
        );

        for (uint256 i = 1; i <= amount; i++) {
            addressMintedPresaleBalance[msg.sender]++;
            availablePresaleAmount--;
            _safeMint(msg.sender, supply + i);
        }
    }

    // public
    function mint(address _to, uint256 _mintAmount) public payable {
        uint256 supply = totalSupply();
        require(_mintAmount > 0, "need to mint at least 1 NFT");
        require(supply + _mintAmount <= maxSupply, "max NFT limit exceeded");

        if (msg.sender != owner()) {
            require(!paused, "the contract is paused");
            require(_mintAmount <= maxMintAmount, "max mint amount per session exceeded");
            require(!onlyWhitelisted, "the public sale has not yet started");
            uint256 ownerMintedCount = addressMintedBalance[msg.sender];
            require(ownerMintedCount + _mintAmount <= nftPerAddressLimit, "max NFT per address limit exceeded");
            require(msg.value == _mintAmount * cost, "Mint: Incorrect payment");
        }

        for (uint256 i = 1; i <= _mintAmount; i++) {
            addressMintedBalance[msg.sender]++;
            availableAmount--;
            _safeMint(_to, supply + i);
        }
    }

    function walletOfOwner(address _owner)
    public
    view
    returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        if(revealed == false) {
            return notRevealedUri;
        }

        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
        ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension))
        : "";
    }

    //only owner
    function reveal() public onlyOwner {
        revealed = true;
    }

    function setNftPerAddressLimit(uint256 _limit) public onlyOwner {
        nftPerAddressLimit = _limit;
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setPresaleCost(uint256 _newCost) public onlyOwner {
        presaleCost = _newCost;
    }

    function setMaxPresaleSupply(uint256 _newmaxPresaleSupply) public onlyOwner {
        maxPresaleSupply = _newmaxPresaleSupply;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
        baseExtension = _newBaseExtension;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedUri = _notRevealedURI;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function setOnlyWhitelisted(bool _state) public onlyOwner {
        onlyWhitelisted = _state;
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }
}
