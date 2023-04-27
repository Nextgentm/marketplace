// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "./OwnCollection1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Factory1155 is AccessControl {
  event Deployed(address owner, address contractAddress);

  // Create a new role identifier for the minter role
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(ADMIN_ROLE, msg.sender);
  }

  function deploy(
    bytes32 _salt,
    string memory name,
    string memory symbol,
    string memory tokenURIPrefix
  ) external onlyRole(ADMIN_ROLE) returns (address addr) {
    addr = address(new LootmogulUser1155Token{ salt: _salt }(name, symbol, tokenURIPrefix));
    LootmogulUser1155Token token = LootmogulUser1155Token(address(addr));
    token.transferOwnership(msg.sender);
    emit Deployed(msg.sender, addr);
  }
}
