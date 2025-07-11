//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./common/ERC2981.sol";

// import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract NFTMarketplace is
  Initializable,
  ERC721Upgradeable,
  ERC721URIStorageUpgradeable,
  ERC721BurnableUpgradeable,
  ERC2981
{
  using CountersUpgradeable for CountersUpgradeable.Counter;
  //_tokenIds variable has the most recent minted tokenId
  CountersUpgradeable.Counter private _tokenIds;
  //Keeps track of the number of items sold on the marketplace
  CountersUpgradeable.Counter private _itemsSold;
  //owner is the contract address that created the smart contract
  address payable owner;
  //The fee charged by the marketplace to be allowed to list an NFT
  uint256 public listPrice = 0.01 ether;

  //The structure to store info about a listed token
  struct ListedToken {
    uint256 tokenId;
    address payable owner;
    address payable seller;
    uint256 price;
    bool currentlyListed;
  }

  //This mapping maps tokenId to token info and is helpful when retrieving details about a tokenId
  mapping(uint256 => ListedToken) private idToListedToken;

  //the event emitted when a token is successfully listed
  event TokenListedSuccess(uint256 indexed tokenId, address owner, address seller, uint256 price, bool currentlyListed);

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this method");
    _;
  }

  modifier onlyNFTOwner(uint256 _tokenId) {
    require(msg.sender == ownerOf(_tokenId), "You don't own this NFT");
    _;
  }

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(string memory _name, string memory _symbol) public initializer {
    __ERC721_init(_name, _symbol);
    __ERC721URIStorage_init();
    __ERC721Burnable_init();
    owner = payable(msg.sender);
  }

  function transferOwnership(address newOwner) public onlyOwner {
    emit OwnershipTransferred(owner, newOwner);
    owner = payable(newOwner);
  }

  // The following functions are overrides required by Solidity.
  function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
    super._burn(tokenId);
  }

  function tokenURI(
    uint256 tokenId
  ) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function updateListPrice(uint256 _listPrice) public payable onlyOwner {
    listPrice = _listPrice;
  }

  function getListPrice() public view returns (uint256) {
    return listPrice;
  }

  function getLatestIdToListedToken() public view returns (ListedToken memory) {
    uint256 currentTokenId = _tokenIds.current();
    return idToListedToken[currentTokenId];
  }

  function getListedTokenForId(uint256 tokenId) public view returns (ListedToken memory) {
    return idToListedToken[tokenId];
  }

  function getCurrentToken() public view returns (uint256) {
    return _tokenIds.current();
  }

  //The first time a token is created
  function createToken(string memory _tokenURI, uint96 _royaltyFee) public onlyOwner returns (uint256) {
    //Increment the tokenId counter, which is keeping track of the number of minted NFTs
    _tokenIds.increment();
    uint256 newTokenId = _tokenIds.current();

    //Mint the NFT with tokenId newTokenId to the address who called createToken
    _safeMint(msg.sender, newTokenId);
    // set royalty of nft
    _setTokenRoyalty(newTokenId, _msgSender(), _royaltyFee); // 20 for 2% royalty

    //Map the tokenId to the tokenURI (which is an IPFS URL with the NFT metadata)
    _setTokenURI(newTokenId, _tokenURI);

    return newTokenId;
  }

  //The first time a token is created, it is listed here
  // function createToken(
  //     string memory tokenURI,
  //     uint256 price,
  //     bool listOnSale
  // ) public onlyOwner returns (uint256) {
  //     //Increment the tokenId counter, which is keeping track of the number of minted NFTs
  //     _tokenIds.increment();
  //     uint256 newTokenId = _tokenIds.current();

  //     //Mint the NFT with tokenId newTokenId to the address who called createToken
  //     _safeMint(msg.sender, newTokenId);

  //     //Map the tokenId to the tokenURI (which is an IPFS URL with the NFT metadata)
  //     _setTokenURI(newTokenId, tokenURI);

  //     if (listOnSale) {
  //         //Helper function to update Global variables and emit an event
  //         createListedToken(newTokenId, price);
  //     }
  //     return newTokenId;
  // }

  // function createListedToken(uint256 tokenId, uint256 price) public onlyNFTOwner(tokenId) payable {
  //     //Make sure the sender sent enough ETH to pay for listing
  //     require(msg.value == listPrice, "Hopefully sending the correct price");
  //     //Just sanity check
  //     require(price > 0, "Make sure the price isn't negative");

  //     //Update the mapping of tokenId's to Token details, useful for retrieval functions
  //     idToListedToken[tokenId] = ListedToken(
  //         tokenId,
  //         payable(address(this)),
  //         payable(msg.sender),
  //         price,
  //         true
  //     );

  //     _transfer(msg.sender, address(this), tokenId);
  //     //Emit the event for successful transfer. The frontend parses this message and updates the end user
  //     emit TokenListedSuccess(
  //         tokenId,
  //         address(this),
  //         msg.sender,
  //         price,
  //         true
  //     );
  // }

  // function getAllNFTs() public view returns (ListedToken[] memory) {
  //     uint256 nftCount = _tokenIds.current();
  //     ListedToken[] memory tokens = new ListedToken[](nftCount);
  //     uint256 currentIndex = 0;
  //     uint256 currentId;
  //     //at the moment currentlyListed is true for all, if it becomes false in the future we will
  //     //filter out currentlyListed == false over here
  //     for (uint256 i = 0; i < nftCount; i++) {
  //         currentId = i + 1;
  //         ListedToken storage currentItem = idToListedToken[currentId];
  //         tokens[currentIndex] = currentItem;
  //         currentIndex += 1;
  //     }
  //     //the array 'tokens' has the list of all NFTs in the marketplace
  //     return tokens;
  // }

  //Returns all the NFTs that the current user is owner or seller in
  // function getMyNFTs() public view returns (ListedToken[] memory) {
  //     uint256 totalItemCount = _tokenIds.current();
  //     uint256 itemCount = 0;
  //     uint256 currentIndex = 0;
  //     uint256 currentId;
  //     //Important to get a count of all the NFTs that belong to the user before we can make an array for them
  //     for (uint256 i = 0; i < totalItemCount; i++) {
  //         if (
  //             idToListedToken[i + 1].owner == msg.sender ||
  //             idToListedToken[i + 1].seller == msg.sender
  //         ) {
  //             itemCount += 1;
  //         }
  //     }

  //     //Once you have the count of relevant NFTs, create an array then store all the NFTs in it
  //     ListedToken[] memory items = new ListedToken[](itemCount);
  //     for (uint256 i = 0; i < totalItemCount; i++) {
  //         if (
  //             idToListedToken[i + 1].owner == msg.sender ||
  //             idToListedToken[i + 1].seller == msg.sender
  //         ) {
  //             currentId = i + 1;
  //             ListedToken storage currentItem = idToListedToken[currentId];
  //             items[currentIndex] = currentItem;
  //             currentIndex += 1;
  //         }
  //     }
  //     return items;
  // }

  // function executeSale(uint256 tokenId) public payable {
  //     uint256 price = idToListedToken[tokenId].price;
  //     address seller = idToListedToken[tokenId].seller;
  //     require(
  //         msg.value == price,
  //         "Please submit the asking price in order to complete the purchase"
  //     );

  //     //update the details of the token
  //     idToListedToken[tokenId].currentlyListed = true;
  //     idToListedToken[tokenId].seller = payable(msg.sender);
  //     _itemsSold.increment();

  //     //Actually transfer the token to the new owner
  //     _transfer(address(this), msg.sender, tokenId);
  //     //approve the marketplace to sell NFTs on your behalf
  //     approve(address(this), tokenId);

  //     //Transfer the listing fee to the marketplace creator
  //     payable(owner).transfer(listPrice);
  //     //Transfer the proceeds from the sale to the seller of the NFT
  //     payable(seller).transfer(msg.value);
  // }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC2981, ERC721Upgradeable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
