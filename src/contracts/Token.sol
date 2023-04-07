// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract token is ERC20, Ownable {

    constructor(address creator) ERC20("Proxime", "PRO") {
        _mint(creator, 5000000000 * 10 ** decimals());
    }
}