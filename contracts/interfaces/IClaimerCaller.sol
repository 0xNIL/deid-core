// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title IClaimerCaller
 * @author Francesco Sullo <francesco@sullo.co>
 */

interface IClaimerCaller {
    event ClaimerSet(address indexed _store);

    event ClaimerUpdated(address indexed _store);

    function setClaimer(address claimer_) external;

}
