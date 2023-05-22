// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./OwnCollection721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract Factory721 is AccessControl {
    address public beacon;

    // Create a new role identifier for the minter role
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event Deployed(address owner, address contractAddress);

    constructor(address _beacon) {
        beacon = _beacon;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function deploy(
        bytes32 _salt,
        string memory name,
        string memory symbol,
        string memory tokenURIPrefix
    ) external onlyRole(ADMIN_ROLE) returns (address addr) {
        BeaconProxy beaconProxy = new BeaconProxy(
                    beacon,
                    abi.encodeWithSelector(
                        NFTMarketplace(address(0)).initialize.selector,
                        name,
                        symbol
                    )
                );
        addr = address(beaconProxy);
        NFTMarketplace token = NFTMarketplace(addr);
        token.transferOwnership(msg.sender);
        emit Deployed(msg.sender, addr);
    }

}
