// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IApplication
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Key/value store for apps
 */


interface IApplication {

    event AppAdded(uint indexed id, bytes32 indexed nickname);

    function addApp(bytes32 nickname_) external;

}
