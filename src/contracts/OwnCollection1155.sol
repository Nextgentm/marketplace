// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "./common/ERC2981.sol";

contract LootmogulUser1155Token is
  Initializable,
  ERC1155BurnableUpgradeable,
  ERC1155SupplyUpgradeable,
  ERC2981,
  AccessControlUpgradeable
{
  using CountersUpgradeable for CountersUpgradeable.Counter;
  using Strings for uint256;
  CountersUpgradeable.Counter private _tokenIdTracker;
  mapping(uint256 => string) private _tokenURIs;

  // Create a new role identifier for the minter role
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  string private baseTokenURI;
  string private _name;
  string private _symbol;
  address public owner;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  event BaseURIChanged(string indexed uri, string indexed newuri);

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    string memory _tokenName,
    string memory _tokenSymbol,
    string memory _baseTokenURI
  ) public initializer {
    __ERC1155_init(_baseTokenURI);
    __ERC1155Supply_init();
    __ERC1155Burnable_init();
    __AccessControl_init();

    baseTokenURI = _baseTokenURI;
    owner = _msgSender();
    _setupRole(ADMIN_ROLE, msg.sender);
    _name = _tokenName;
    _symbol = _tokenSymbol;
    _tokenIdTracker.increment();
  }

  function name() external view returns (string memory) {
    return _name;
  }

  function symbol() external view returns (string memory) {
    return _symbol;
  }

  /** @dev change the Ownership from current owner to newOwner address
        @param newOwner : newOwner address 
    */

  function transferOwnership(address newOwner) external onlyRole(ADMIN_ROLE) returns (bool) {
    require(newOwner != address(0), "Ownable: new owner is the zero address");
    _revokeRole(ADMIN_ROLE, owner);
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
    _setupRole(ADMIN_ROLE, newOwner);
    return true;
  }

  function setBaseURI(string memory uri_) external onlyRole(ADMIN_ROLE) returns (bool) {
    emit BaseURIChanged(baseTokenURI, uri_);
    baseTokenURI = uri_;
    return true;
  }

  function mint(
    string memory _tokenURI,
    uint96 _royaltyFee,
    uint256 supply
  ) external virtual onlyRole(ADMIN_ROLE) returns (uint256 _tokenId) {
    // We cannot just use balanceOf to create the new tokenId because tokens
    // can be burned (destroyed), so we need a separate counter.
    _tokenId = _tokenIdTracker.current();
    _mint(_msgSender(), _tokenId, supply, "");
    _tokenURIs[_tokenId] = _tokenURI;
    _setTokenRoyalty(_tokenId, _msgSender(), _royaltyFee);
    _tokenIdTracker.increment();
    return _tokenId;
  }

  function uri(uint256 tokenId) public view virtual override returns (string memory) {
    require(exists(tokenId), "ERC1155URIStorage: URI query for nonexistent token");

    string memory _tokenURI = _tokenURIs[tokenId];
    // If there is no base URI, return the token URI.
    if (bytes(baseTokenURI).length == 0) {
      return _tokenURI;
    }
    // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
    if (bytes(_tokenURI).length > 0) {
      return string(abi.encodePacked(baseTokenURI, _tokenURI));
    }
    return bytes(baseTokenURI).length > 0 ? string(abi.encodePacked(baseTokenURI, tokenId.toString())) : "";
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC2981, ERC1155Upgradeable, AccessControlUpgradeable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  function _beforeTokenTransfer(
    address _operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal virtual override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) {
    super._beforeTokenTransfer(_operator, from, to, ids, amounts, data);
  }
}
