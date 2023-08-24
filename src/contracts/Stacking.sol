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
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract StakingNFT is
  PausableUpgradeable,
  AccessControlUpgradeable,
  UUPSUpgradeable,
  ReentrancyGuardUpgradeable,
  ERC1155Holder
{
  struct StakingInfo {
    uint256 stakedAmount;
    uint256 oldBalance;
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
  uint256 public rewardRateDuration; //604800

  // pay Reward in crypto
  bool public payReward;

  mapping(address => bool) public whitelistContracts;

  //percetage fee charged on unstaking amount
  uint256 public unstakeFee;

  /**************************************************/
  /******************** Events **********************/
  /**************************************************/
  event TokensStaked(
    address indexed user,
    address indexed tokenContract,
    uint256 indexed tokenId,
    uint256 amount,
    uint256 index
  );
  event TokensUnstaked(
    address indexed user,
    address indexed tokenContract,
    uint256 indexed tokenId,
    uint256 amount,
    uint256 index
  );
  event TokenRestaked(
    address indexed user,
    address indexed tokenContract,
    uint256 indexed tokenId,
    uint256 amount,
    uint256 index,
    uint256 timestamp
  );
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

  modifier onlyWhitelisted(address _stakeTokenContractAddress) {
    require(whitelistContracts[_stakeTokenContractAddress], "Whitelist: NFT contract is not whitelisted");
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

  // set the unstakeFee
  function setUnstakeFee(uint256 _unstakeFee) external onlyAdmin {
    unstakeFee = _unstakeFee;
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

  //Stake functions
  function stakeToken(
    address _tokenContract,
    uint256 _tokenId,
    uint256 _stakedAmount,
    uint8 _tokenType // _tokenType 0 for ERC1155 and 1 for ERC71
  ) external onlyWhitelisted(_tokenContract) whenNotPaused {
    if (_tokenType == 1) {
      require(IERC721(_tokenContract).ownerOf(_tokenId) == msg.sender, "TokenStaking: Caller must own the NFT token");

      IERC721(_tokenContract).transferFrom(msg.sender, address(this), _tokenId);
    } else {
      require(
        IERC1155(_tokenContract).balanceOf(msg.sender, _tokenId) >= _stakedAmount,
        "TokenStaking: Caller must have sufficient ERC1155 token balance"
      );

      IERC1155(_tokenContract).safeTransferFrom(msg.sender, address(this), _tokenId, _stakedAmount, "0x");
    }

    StakingInfo memory newStaking = StakingInfo({
      stakedAmount: _stakedAmount,
      timeOfLastUpdate: block.timestamp,
      oldBalance: 0
    });

    uint256 index = stakedBalances[msg.sender][_tokenContract][_tokenId].length;
    stakedBalances[msg.sender][_tokenContract][_tokenId].push(newStaking);

    emit TokensStaked(msg.sender, _tokenContract, _tokenId, _stakedAmount, index);
  }

  // function stakeTokenBatch(
  //   address[] calldata _tokenContract,
  //   uint256[] calldata _tokenType,
  //   uint256[] calldata _tokenId,
  //   uint256[] calldata _stakedAmount
  // ) external whenNotPaused {
  //   // check input length
  //   require(
  //     _tokenContract.length == _tokenType.length &&
  //       _tokenContract.length == _tokenId.length &&
  //       _tokenContract.length == _stakedAmount.length,
  //     "TokenStaking: input array length is invalid"
  //   );

  //   uint256 len = _tokenContract.length;
  //   uint256 i;
  //   for (i; i < len; i++) {
  //     require(whitelistContracts[_tokenContract[i]], "Whitelist: NFT contract is not whitelisted");
  //     // check token type and transfer it
  //     if (_tokenType[i] == 0) {
  //       require(
  //         IERC1155(_tokenContract[i]).balanceOf(msg.sender, _tokenId[i]) >= _stakedAmount[i],
  //         "TokenStaking: Caller must have sufficient ERC1155 token balance"
  //       );
  //       IERC1155(_tokenContract[i]).safeTransferFrom(msg.sender, address(this), _tokenId[i], _stakedAmount[i], "0x");
  //     } else {
  //       require(
  //         IERC721(_tokenContract[i]).ownerOf(_tokenId[i]) == msg.sender,
  //         "TokenStaking: Caller must own the ERC721 token"
  //       );
  //       IERC721(_tokenContract[i]).transferFrom(msg.sender, address(this), _tokenId[i]);
  //     }
  //     // add stake data
  //     StakingInfo memory newStaking = StakingInfo({
  //       stakedAmount: _stakedAmount[i],
  //       timeOfLastUpdate: block.timestamp,
  //       oldBalance: 0
  //     });
  //     uint256 index = stakedBalances[msg.sender][_tokenContract[i]][_tokenId[i]].length;
  //     stakedBalances[msg.sender][_tokenContract[i]][_tokenId[i]].push(newStaking);

  //     emit TokensStaked(msg.sender, _tokenContract[i], _tokenId[i], _stakedAmount[i], index);
  //   }
  // }

  //Unstake functions
  function unStakeToken(
    address _tokenContract,
    uint256 _tokenId,
    uint256 _unStakedAmount,
    uint256 _index,
    uint8 _tokenType // _tokenType 0 for ERC1155 and 1 for ERC71
  ) external onlyWhitelisted(_tokenContract) whenNotPaused nonReentrant {
    require(
      stakedBalances[msg.sender][_tokenContract][_tokenId][_index].stakedAmount >= _unStakedAmount,
      "TokenStaking: Insufficient Staked NFT token balance"
    );
    if (_tokenType == 1) {
      require(
        IERC721(_tokenContract).ownerOf(_tokenId) == address(this),
        "TokenStaking: Contract must own the ERC721 token"
      );
    } else {
      require(
        IERC1155(_tokenContract).balanceOf(address(this), _tokenId) >= _unStakedAmount,
        "TokenStaking: Contract must have sufficient ERC1155 token balance"
      );
    }
    // claim all rewards for current time
    if (payReward) {
      claimRewards(_tokenContract, _tokenId, _index);
    }
    stakedBalances[msg.sender][_tokenContract][_tokenId][_index].stakedAmount -= _unStakedAmount;

    if (_tokenType == 0) {
      IERC1155(_tokenContract).safeTransferFrom(address(this), msg.sender, _tokenId, _unStakedAmount, "0x");
    } else {
      IERC721(_tokenContract).transferFrom(address(this), msg.sender, _tokenId);
    }

    emit TokensUnstaked(msg.sender, _tokenContract, _tokenId, _unStakedAmount, _index);
  }

  // function unStakeTokenBatch(
  //   address[] calldata _tokenContract,
  //   uint256[] calldata _tokenType,
  //   uint256[] calldata _tokenId,
  //   uint256[] calldata _unStakedAmount,
  //   uint256[] calldata _index
  // ) external whenNotPaused nonReentrant {
  //   // check input length
  //   require(
  //     _tokenContract.length == _tokenType.length &&
  //       _tokenContract.length == _tokenId.length &&
  //       _tokenContract.length == _unStakedAmount.length &&
  //       _tokenContract.length == _index.length,
  //     "TokenStaking: input array length is invalid"
  //   );

  //   uint256 len = _tokenContract.length;
  //   uint256 i;
  //   for (i; i < len; i++) {
  //     require(
  //       stakedBalances[msg.sender][_tokenContract[i]][_tokenId[i]][_index[i]].stakedAmount >= _unStakedAmount[i],
  //       "TokenStaking: Insufficient Staked NFT token balance"
  //     );
  //     if (_tokenType[i] == 0) {
  //       require(
  //         IERC1155(_tokenContract[i]).balanceOf(address(this), _tokenId[i]) >= _unStakedAmount[i],
  //         "TokenStaking: Contract must have sufficient ERC1155 token balance"
  //       );
  //     } else {
  //       require(
  //         IERC721(_tokenContract[i]).ownerOf(_tokenId[i]) == address(this),
  //         "TokenStaking: Contract must own the ERC721 token"
  //       );
  //     }

  //     // claim all rewards for current time
  //     if (payReward) {
  //       claimRewards(_tokenContract[i], _tokenId[i], _index[i]);
  //     }
  //     stakedBalances[msg.sender][_tokenContract[i]][_tokenId[i]][_index[i]].stakedAmount -= _unStakedAmount[i];

  //     if (_tokenType[i] == 0) {
  //       IERC1155(_tokenContract[i]).safeTransferFrom(address(this), msg.sender, _tokenId[i], _unStakedAmount[i], "0x");
  //     } else {
  //       IERC721(_tokenContract[i]).transferFrom(address(this), msg.sender, _tokenId[i]);
  //     }
  //     emit TokensUnstaked(msg.sender, _tokenContract[i], _tokenId[i], _unStakedAmount[i], _index[i]);
  //   }
  // }

  //Restake functions
  function reStakeToken(
    address _tokenContract,
    uint256 _tokenId,
    uint8 _tokenType, // _tokenType 0 for ERC1155 and 1 for ERC71
    uint256 _index
  ) external onlyWhitelisted(_tokenContract) whenNotPaused nonReentrant {
    uint _reStakedAmount = stakedBalances[msg.sender][_tokenContract][_tokenId][_index].stakedAmount;
    require(_reStakedAmount > 0, "TokenStaking: Staking Data not found");
    if (_tokenType == 0) {
      require(
        IERC1155(_tokenContract).balanceOf(address(this), _tokenId) >= _reStakedAmount,
        "TokenStaking: Contract must have sufficient ERC1155 token balance"
      );
    } else {
      require(
        IERC721(_tokenContract).ownerOf(_tokenId) == address(this),
        "TokenStaking: Contract must own the ERC721 token"
      );
    }

    // update old blance and time of last update
    stakedBalances[msg.sender][_tokenContract][_tokenId][_index].oldBalance = calculateRewards(
      msg.sender,
      _tokenContract,
      _tokenId,
      _index
    );
    stakedBalances[msg.sender][_tokenContract][_tokenId][_index].timeOfLastUpdate = block.timestamp;

    emit TokenRestaked(msg.sender, _tokenContract, _tokenId, _reStakedAmount, _index, block.timestamp);
  }

  // function reStakeTokenBatch(
  //   address[] calldata _tokenContract,
  //   uint256[] calldata _tokenType,
  //   uint256[] calldata _tokenId,
  //   uint256[] calldata _index
  // ) external whenNotPaused {
  //   // check input length
  //   require(
  //     _tokenContract.length == _tokenType.length &&
  //       _tokenContract.length == _tokenId.length &&
  //       _tokenContract.length == _index.length,
  //     "TokenStaking: input array length is invalid"
  //   );

  //   uint256 len = _tokenContract.length;
  //   uint256 i;
  //   for (i; i < len; i++) {
  //   uint _reStakedAmount = stakedBalances[msg.sender][_tokenContract[i]][_tokenId[i]][_index[i]].stakedAmount;
  //   require(_reStakedAmount > 0, "TokenStaking: Staking Data not found");
  //   if (_tokenType[i] == 0) {
  //     require(
  //       IERC1155(_tokenContract[i]).balanceOf(address(this), _tokenId[i]) >= _reStakedAmount,
  //       "TokenStaking: Contract must have sufficient ERC1155 token balance"
  //     );
  //   } else {
  //     require(
  //       IERC721(_tokenContract[i]).ownerOf(_tokenId[i]) == address(this),
  //       "TokenStaking: Contract must own the ERC721 token"
  //     );
  //   }

  //   // update old blance and time of last update
  //   stakedBalances[msg.sender][_tokenContract[i]][_tokenId[i]][_index[i]].oldBalance = calculateRewards(
  //     msg.sender,
  //     _tokenContract[i],
  //     _tokenId[i],
  //     _index[i]
  //   );
  //   stakedBalances[msg.sender][_tokenContract[i]][_tokenId[i]][_index[i]].timeOfLastUpdate = block.timestamp;

  //   emit TokenRestaked(msg.sender, _tokenContract[i], _tokenId[i], _reStakedAmount, _index[i], block.timestamp);
  //   }
  // }

  // Claim reward
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
    uint256 unstakeFeeAmount;
    if (unstakeFee > 0) {
      unstakeFeeAmount = _getPortion(rewards, unstakeFee);
    }
    rewardToken.transfer(
      msg.sender,
      stakedBalances[msg.sender][_tokenContract][_tokenId][_index].oldBalance + rewards - unstakeFeeAmount
    );

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
      uint256 stakingEndTime = stakedBalances[_user][_tokenContract][_tokenId][_index].timeOfLastUpdate +
        rewardRateDuration;
      require(block.timestamp > stakingEndTime, "TokenStaking: Staking duration is not completed");
      uint256 totalRewards = rewardRate *
        // rewardDuration *
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
