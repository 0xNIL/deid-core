// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IValidatable
 * @author Francesco Sullo <francesco@sullo.co>
 */

interface IValidatable {

    event ValidForByGroupIdUpdated(uint groupId, uint validForByGroupId);
    event ValidatorAdded(uint groupId, address validator);
    event ValidatorRemoved(uint groupId, address validator);

    function isValidatorForGroup(uint groupId_, address validator_) external view returns (bool);

    function addValidator(uint groupId_, bytes32 validatorName_, address validator_) external;

    function removeValidator(uint groupId_, address validator_) external;

    function updateValidator(uint groupId_, address validator_, address newValidator_) external;

    function updateTimestampValidFor(uint groupId_, uint _validFor) external;

    function getChainId() external view returns (uint256);

    function isValidForGroupId(uint groupId_, uint timestamp_) external view returns (bool);

    function isSignedByValidator(uint groupId_, bytes32 hash_, bytes memory signature_) external view returns (address);

    function getValidatorName(address address_) external view returns (bytes32);

}
