// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title IDeIDClaimer
 * @author Francesco Sullo <francesco@sullo.co>
 */

interface IDeIDClaimer {

    event ClaimStarted(uint indexed appId, uint indexed id, address indexed claimer);

    event ClaimCompleted(uint indexed appId, uint indexed id, address indexed claimer);

    event ClaimCanceled(uint indexed appId, uint indexed id, address indexed claimer);

    event ProbationTimesUpdated(uint probationTime, uint afterProbationTime);

    struct Claim {
        address claimer;
        uint when;
    }

    struct FullClaim {
        address claimer;
        uint appId;
        uint id;
        uint when;
    }

    function updateProbationTimes(uint probationTime_, uint afterProbationTime_) external;

    function activeClaimsByOrAgainst() external view returns (FullClaim[] memory);

    function setClaim(uint appId_, uint id_, address claimer_) external;

    function cancelActiveClaim(uint appId_) external;

    function setClaimedIdentity(uint appId_, uint id_, address claimer_) external;

    function claimByAddress(uint appId_, address address_) external view returns (uint);

    function claimById(uint appId_, uint id_) external view returns (Claim memory);

}
