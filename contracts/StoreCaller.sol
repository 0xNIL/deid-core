// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title StoreCaller
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "@openzeppelin/contracts/access/AccessControl.sol";


interface IStoreMinimal {

    function lastAppId() external view returns (uint);

    function idByAddress(uint appId_, address address_) external view returns (uint);

    function addressById(uint appId_, uint id_) external view returns (address);

    function setAddressAndIdByAppId(uint appId_, address address_, uint id_) external;

    function updateAddressByAppId(uint appId_, address oldAddress_, address newAddress_) external;
}

contract StoreCaller is AccessControl {

    event StoreSet(address indexed _store);
    event StoreUpdated(address indexed _store);

    IStoreMinimal public store;

    bool public isStoreSet;

    modifier onlyIfStoreSet() {
        require(
            isStoreSet,
            "Store not set yet"
        );
        _;
    }

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setStore(
        address store_
    ) public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        if (store_ != address(0)) {
            store = IStoreMinimal(store_);
            if (!isStoreSet) {
                isStoreSet = true;
                emit StoreSet(store_);
            } else {
                emit StoreUpdated(store_);
            }
        }
    }

}
