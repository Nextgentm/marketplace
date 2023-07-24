// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract StakingNFT is PausableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable, ReentrancyGuard, ERC1155Holder {
  struct StakingInfo {
    uint256 stakedAmount;
    uint256 timeOfLastUpdate;
  }

  // user => contract=> tokenid => StakingInfo
  mapping(address => mapping(address => mapping(uint256 => StakingInfo[]))) public stakedBalances;

  // the staking and reward token
  IERC20 public rewardToken;
  // the reward rate in percentage
  uint256 public rewardRate;
  // the reward rate duration
  // so the final reward rate will be re (rewardRate/rewardRateDuration)
  uint256 public rewardRateDuration;

  // Total stake amount
  uint256 public totalStakedAmount;

  // pay Reward in crypto
  bool public payReward;

  mapping(address => bool) public whitelistContracts;

  /**************************************************/
  /******************** Events **********************/
  /**************************************************/
  event TokensStaked(address indexed user, address indexed tokenContract, uint256 indexed tokenId, uint256 amount);
  event TokensUnstaked(address indexed user, address indexed tokenContract, uint256 indexed tokenId, uint256 amount);
  event RewardsClaimed(address indexed user, uint256 amount);

  event AddressAdded(address indexed account);
  event AddressRemoved(address indexed account);

  /**************************************************/
  /****************** Constructor *******************/
  /**************************************************/
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(address _rewardToken, uint256 _rewardRate, uint256 _rewardRateDuration) public initializer {
    rewardToken = IERC20(_rewardToken);
    rewardRate = _rewardRate;
    rewardRateDuration = _rewardRateDuration;

    __AccessControl_init();
    __UUPSUpgradeable_init();
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /**************************************************/
  /*******************  Modifiers *******************/
  /**************************************************/
  modifier amountGreaterThenZero(uint256 _amount) {
    require(_amount > 0, "Amount can't be zero");
    _;
  }

  modifier onlyWhitelisted(address _stakTokenContractAddress) {
    require(whitelistContracts[_stakTokenContractAddress], "Whitelist: NFT contract is not whitelisted");
    _;
  }

  modifier onlyAdmin() {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Whitelist: Only admin can call this method");
    _;
  }

  /**************************************************/
  /************** Internal View Functions *************/
  /**************************************************/
  // helper function
  function _getPortion(uint256 _amount, uint256 _percentage) internal pure returns (uint256) {
    return (_amount * _percentage) / 1000;
  }

  /**************************************************/
  /*************Owner Calling Functions *************/
  /**************************************************/

  // set the reward rate
  function setRewardRate(uint256 _rewardRate) external onlyAdmin {
    rewardRate = _rewardRate;
  }

  // set the reward rate duration
  function setRewardRateDuration(uint256 _rewardRateDuration) external onlyAdmin {
    rewardRateDuration = _rewardRateDuration;
  }

  // set the payReward
  function setPayReward(bool _payReward) external onlyAdmin {
    payReward = _payReward;
  }

  // transfer token from this account to other if needed
  function transferToken(address _to, uint256 _amount) external onlyAdmin {
    require(rewardToken.transfer(_to, _amount), "Token transfer failed!");
  }

  function pause() public onlyAdmin {
    _pause();
  }

  function unpause() public onlyAdmin {
    _unpause();
  }

  /**************************************************/
  /********** External Contract Functions ***********/
  /**************************************************/
  function stakERC721Token(
    address _erc721Contract,
    uint256 _tokenId
  ) external onlyWhitelisted(_erc721Contract) whenNotPaused returns (uint256 index) {
    require(IERC721(_erc721Contract).ownerOf(_tokenId) == msg.sender, "TokenStaking: Caller must own the ERC721 token");

    IERC721(_erc721Contract).transferFrom(msg.sender, address(this), _tokenId);

    StakingInfo memory newStaking = StakingInfo({ stakedAmount: 1, timeOfLastUpdate: block.timestamp });

    index = stakedBalances[msg.sender][_erc721Contract][_tokenId].length;
    stakedBalances[msg.sender][_erc721Contract][_tokenId].push(newStaking);

    emit TokensStaked(msg.sender, _erc721Contract, _tokenId, 1);

    return index;
  }

  function stakERC1155Token(
    address _erc1155Contract,
    uint256 _tokenId,
    uint256 _stakedAmount
  ) external onlyWhitelisted(_erc1155Contract) whenNotPaused returns (uint256 index) {
    require(
      IERC1155(_erc1155Contract).balanceOf(msg.sender, _tokenId) >= _stakedAmount,
      "TokenStaking: Caller must have sufficient ERC1155 token balance"
    );

    IERC1155(_erc1155Contract).safeTransferFrom(msg.sender, address(this), _tokenId, _stakedAmount, "0x");

    StakingInfo memory newStaking = StakingInfo({ stakedAmount: _stakedAmount, timeOfLastUpdate: block.timestamp });

    index = stakedBalances[msg.sender][_erc1155Contract][_tokenId].length;
    stakedBalances[msg.sender][_erc1155Contract][_tokenId].push(newStaking);

    emit TokensStaked(msg.sender, _erc1155Contract, _tokenId, _stakedAmount);

    return index;
  }

  function unStakERC721Token(
    address _erc721Contract,
    uint256 _tokenId,
    uint256 _index
  ) external onlyWhitelisted(_erc721Contract) whenNotPaused nonReentrant {
    require(
      stakedBalances[msg.sender][_erc721Contract][_tokenId][_index].stakedAmount >= 1,
      "TokenStaking: ERC721 token is not Staked"
    );

    require(
      IERC721(_erc721Contract).ownerOf(_tokenId) == address(this),
      "TokenStaking: Contract must own the ERC721 token"
    );

    // claim all rewards for current time
    if (payReward) {
      claimRewards(_erc721Contract, _tokenId, _index);
    }

    stakedBalances[msg.sender][_erc721Contract][_tokenId][_index].stakedAmount -= 1;

    IERC721(_erc721Contract).transferFrom(address(this), msg.sender, _tokenId);

    emit TokensUnstaked(msg.sender, _erc721Contract, _tokenId, 1);
  }

  function unStakERC1155Token(
    address _erc1155Contract,
    uint256 _tokenId,
    uint256 _unStakedAmount,
    uint256 _index
  ) external onlyWhitelisted(_erc1155Contract) nonReentrant {
    require(
      stakedBalances[msg.sender][_erc1155Contract][_tokenId][_index].stakedAmount >= _unStakedAmount,
      "TokenStaking: Insufficient Staked ERC1155 token balance"
    );

    require(
      IERC1155(_erc1155Contract).balanceOf(address(this), _tokenId) >= _unStakedAmount,
      "TokenStaking: Contract must have sufficient ERC1155 token balance"
    );

    // claim all rewards for current time
    if (payReward) {
      claimRewards(_erc1155Contract, _tokenId, _index);
    }
    stakedBalances[msg.sender][_erc1155Contract][_tokenId][_index].stakedAmount -= _unStakedAmount;

    IERC1155(_erc1155Contract).safeTransferFrom(address(this), msg.sender, _tokenId, _unStakedAmount, "0x");

    emit TokensUnstaked(msg.sender, _erc1155Contract, _tokenId, _unStakedAmount);
  }

  function claimRewards(
    address _tokenContract,
    uint256 _tokenId,
    uint256 _index
  ) internal whenNotPaused onlyWhitelisted(_tokenContract) returns (bool) {
    // get claimed amount _msgSender
    uint256 rewards = calculateRewards(msg.sender, _tokenContract, _tokenId, _index);

    require(rewards > 0, "TokenStaking: No rewards available");
    require(rewardToken.balanceOf(address(this)) >= rewards, "TokenStaking: Insufficient reward balance");

    stakedBalances[msg.sender][_tokenContract][_tokenId][_index].timeOfLastUpdate = block.timestamp;

    // transfer reward amount
    rewardToken.transfer(msg.sender, rewards);

    emit RewardsClaimed(msg.sender, rewards);

    return true;
  }

  function calculateRewards(
    address _user,
    address _tokenContract,
    uint256 _tokenId,
    uint256 _index
  ) public view returns (uint256) {
    require(stakedBalances[_user][_tokenContract][_tokenId].length > _index, "TokenStaking: invalid index");
    if (stakedBalances[_user][_tokenContract][_tokenId][_index].stakedAmount > 0) {
      uint256 StakingTime = block.timestamp - stakedBalances[_user][_tokenContract][_tokenId][_index].timeOfLastUpdate;
      uint256 rewardDuration = StakingTime / rewardRateDuration;
      require(rewardDuration > 0, "TokenStaking: Staking duration is not completed");
      uint256 totalRewards = rewardRate *
        rewardDuration *
        stakedBalances[_user][_tokenContract][_tokenId][_index].stakedAmount;

      return totalRewards;
    }
    return 0;
  }

  /**************************************************/
  /********* Whitelisted Contract Functions *********/
  /**************************************************/

  function addToWhitelist(address[] calldata _whitelistContracts) external onlyAdmin {
    for (uint256 i = 0; i < _whitelistContracts.length; i++) {
      address account = _whitelistContracts[i];
      require(account != address(0), "Whitelist: Cannot add zero address");

      if (!whitelistContracts[account]) {
        whitelistContracts[account] = true;
        emit AddressAdded(account);
      }
    }
  }

  function removeFromWhitelist(address[] calldata _whitelistContracts) external onlyAdmin {
    for (uint256 i = 0; i < _whitelistContracts.length; i++) {
      address account = _whitelistContracts[i];
      require(whitelistContracts[account], "Whitelist: Account is not whitelisted");

      whitelistContracts[account] = false;
      emit AddressRemoved(account);
    }
  }

  /**
   *  _authorizeUpgrade
   */
  function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC1155Receiver, AccessControlUpgradeable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
