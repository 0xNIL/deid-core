// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IDeIDStore
 * @author Francesco Sullo <francesco@sullo.co>
 */


interface IDeIDStore {
    event IdentitySet(uint indexed appId_, uint indexed _id, address indexed address_);

    event IdentityUpdated(uint indexed appId_, uint indexed _id, address indexed address_);

    event DataChanged(uint indexed _id, bytes32 indexed key, bytes value);

    event UniqueDataChanged(uint indexed _id, bytes32 indexed key, bytes32 value);

    function setExtraKey(bytes32 key_, bool unique_, bool immutable_) external;

    function getExtras(address address_, bytes32 key_) external view returns (bytes memory value_);

    function setExtras(bytes32 key_, bytes calldata value_) external;

    function getUniqueExtras(address address_, bytes32 key_) external view returns (bytes32 value_);

    function setUniqueExtras(bytes32 key_, bytes32 value_) external;

    function setAddressAndIdByAppId(uint appId_, address address_, uint id_) external;

    function updateAddressByAppId(uint appId_, address oldAddress_, address newAddress_) external;

    function profile(address address_) external view returns (uint[] memory);

    function profile() external view returns (uint[] memory);

    function idByAddress(uint appId_, address address_) external view returns (uint);

    function addressById(uint appId_, uint id_) external view returns (address);

}
