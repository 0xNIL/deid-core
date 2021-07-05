// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title ClaimerCaller
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IClaimerMinimal {

    function setClaim(
        uint appId_,
        uint id_,
        address claimer_
    ) external;

    function setClaimedIdentity(
        uint appId_,
        uint id_,
        address claimer_
    ) external;

}

contract ClaimerCaller is AccessControl {

    event ClaimerSet(address indexed _store);
    event ClaimerUpdated(address indexed _store);

    IClaimerMinimal public claimer;

    bool public isClaimerSet;

    modifier onlyIfClaimerSet() {
        require(
            isClaimerSet,
            "Claimer not set yet"
        );
        _;
    }

    constructor(
        address claimer_
    )
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        setClaimer(claimer_);
    }

    function setClaimer(
        address claimer_
    ) public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        if (claimer_ != address(0)) {
            claimer = IClaimerMinimal(claimer_);
            if (!isClaimerSet) {
                isClaimerSet = true;
                emit ClaimerSet(claimer_);
            } else {
                emit ClaimerUpdated(claimer_);
            }
        }
    }

}
