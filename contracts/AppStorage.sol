// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Application
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Key/value store for apps
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

import "./interfaces/IAppStorage.sol";

contract AppStorage is AccessControl, IAppStorage {

    uint constant public maxNumberOfApps = 100;

    uint public lastAppId;
    mapping(uint => bytes32) public apps;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        apps[0] = keccak256("default");
    }

    function addApp(
        bytes32 nickname_
    ) external override
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        require(
            nickname_ > 0,
            "Empty nickname"
        );
        require(
            lastAppId < maxNumberOfApps - 1,
            "Limit reached. New apps not allowed"
        );

        lastAppId++;
        apps[lastAppId] = nickname_;
        emit AppAdded(lastAppId, nickname_);
    }

}
