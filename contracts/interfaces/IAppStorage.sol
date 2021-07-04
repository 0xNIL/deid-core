// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IAppStorage
 * @author Francesco Sullo <francesco@sullo.co>
 */

interface IAppStorage {

    event AppAdded(uint indexed id, bytes32 indexed nickname);

    function addApp(bytes32 nickname_) external;

}
