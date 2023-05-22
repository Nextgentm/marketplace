// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BeaconContract is Ownable, IBeacon {

    UpgradeableBeacon immutable beacon;

    address private logic;

    constructor(address _initLogic) {
        beacon=new UpgradeableBeacon(_initLogic);
        logic=_initLogic;
        transferOwnership(tx.origin);
    }

    function update(address _newLogic)
        public
        onlyOwner
    {
        beacon.upgradeTo(_newLogic);
        logic=_newLogic;
    }

    function implementation() public view returns(address){
        return logic;
    }
}
