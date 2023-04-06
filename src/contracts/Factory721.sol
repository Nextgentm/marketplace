// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "./OwnCollection721.sol";

contract Factory721 {
    event Deployed(address owner, address contractAddress);

    function deploy() external returns (address addr) {
        addr = address(
            new NFTMarketplace()
        );
       NFTMarketplace(address(addr));
        emit Deployed(msg.sender, addr);
    }
}
