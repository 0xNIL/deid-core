// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title IDeIDManager
 * @author Francesco Sullo <francesco@sullo.co>
 */

interface IDeIDManager {

    function setMyIdentity() external;

    function setIdentity(uint appId_, uint id_, uint timestamp_, bytes memory signature_) external;

    function setMultipleIdentities(uint[] memory appIds_, uint[] memory ids_, uint timestamp_, bytes[] memory signatures_) external;

    function updateIdentity(uint appId_, address newAddress_) external;

    function claimIdentity(uint appId_, uint id_, uint timestamp_, bytes memory signature_) external;

    function updateClaimedIdentity(uint appId_, uint id_, uint timestamp_, bytes memory signature_) external;

    function encodeForSignature(address address_, uint groupId_, uint id_, uint timestamp_) external view returns (bytes32);

    function encodeForSignature(address address_, uint[] memory groupIds_, uint[] memory ids_, uint timestamp_) external view returns (bytes32);

    function encodeForSignature(address address_, uint groupId_, uint[] memory ids_, uint timestamp_) external view returns (bytes32);

}
