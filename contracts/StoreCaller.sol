// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title StoreCaller
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./interfaces/IStoreCaller.sol";

interface IStoreMinimal {

    function totalIdentities() external view returns (uint);

    function lastAppId() external view returns (uint);

    function chainProgressiveId() external view returns (uint);

    function maxNumberOfChains() external view returns (uint);

    function maxNumberOfApps() external view returns (uint);

    function idByAddress(uint appId_, address address_) external view returns (uint);

    function addressById(uint appId_, uint id_) external view returns (address);

    function setAddressAndIdByAppId(uint appId_, address address_, uint id_) external;

    function setNickname(bytes32 nickname_) external;

    function updateAddressByAppId(uint appId_, address oldAddress_, address newAddress_) external;
}

contract StoreCaller is AccessControl, IStoreCaller {

    IStoreMinimal public store;

    bool public storeSet;

    modifier onlyIfStoreSet() {
        require(
            storeSet,
            "Store not set yet"
        );
        _;
    }

    constructor(
        address store_
    )
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        setStore(store_);
    }

    function setStore(
        address store_
    ) public override
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        if (!storeSet && store_ != address(0)) {
            store = IStoreMinimal(store_);
            storeSet = true;
            emit StoreSet(store_);
        }
    }

}
