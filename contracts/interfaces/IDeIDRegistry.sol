// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IDeIDRegistry
 * @author Francesco Sullo <francesco@sullo.co>
 */

interface IDeIDRegistry {

    event RegistryUpdated(bytes32 contractName, address contractAddress);

    function setData(bytes32 name_, address address_) external;

    function updateData(bytes32 name_, address address_) external;


}
