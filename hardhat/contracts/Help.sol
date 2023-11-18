// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OptimisticOracleV3Interface} from "./interfaces/OptimisticOracleV3Interface.sol";

contract Help is Ownable {
    OptimisticOracleV3Interface private immutable _oov3;
    uint64 public defaultLiveness;
    IERC20 public defaultCurrency;
    bytes32 private constant _defaultIdentifier = "ASSERT_TRUTH";

    enum AgentStatus {
        Unapproved,
        Approved,
        Suspended
    }

    struct Agent {
        address agentAddress;
        string name;
        string location;
        AgentStatus status;
    }

    mapping(address => Agent) public agents;


    // ========================================
    //     CONSTRUCTOR AND CORE FUNCTIONS
    // ========================================

    /**
     * @notice Constructs the Help contract.
     * @param _currency the currency to use for assertions.
     * @param _liveness the liveness to use for assertions.
     * @param __oov3 the address of the OptimisticOracleV3 contract.
     */
    constructor(IERC20 _currency, uint64 _liveness, address __oov3) {
        defaultCurrency = _currency;
        defaultLiveness = _liveness;
        _oov3 = OptimisticOracleV3Interface(__oov3);
    }

    // ========================================
    //     AGENT FUNCTIONS
    // ========================================

    function agentRegister(string memory _name, string memory _location) public {
        require(agents[msg.sender].agentAddress == address(0), "Agent already registered");
        agents[msg.sender] = Agent(msg.sender, _name, _location, AgentStatus.Unapproved);
    }


    // ========================================
    //     UMA FUNCTIONS
    // ========================================

    function agentInitateFundRequest(bytes memory _disasterDescription, bytes memory _householdsAffected) public returns (bytes32) {
        // todo: check if agent (msg.sender) exists and is approved
        // todo: check is request is within budget
        // todo: check if another request is pending
        
        bytes32 assertionId = _oov3.assertTruth(
            createFinalClaimAssembly(_disasterDescription, _householdsAffected),
            address(this), // asserter
            address(0), // callbackRecipient
            address(0), // escalationManager
            defaultLiveness,
            defaultCurrency,
            _oov3.getMinimumBond(address(defaultCurrency)),
            _defaultIdentifier,
            bytes32(0) // domainId
        );
        return assertionId;
    }

    function serverSettleAssertion(bytes32 _assertionId) external returns (bool) {
        // todo: check if assertionId is not valid
        return _oov3.settleAndGetAssertionResult(_assertionId);
    }

    
    /**
     * @notice Returns the result of the assertion.
     * @param _assertionId the assertionId of the claim.
     * @dev This function can only be called once the assertion has been settled, otherwise it reverts.
     * @return result the result of the assertion (true/false).
     */
    function getAssertionResult(bytes32 _assertionId) public view returns (bool) {
        return
            _oov3.getAssertionResult(_assertionId);
    }


    // /**
    //  * @notice Returns the full assertion object contain all information associated with the assertion.
    //  * @param _assertionId the assertionId of the claim.
    //  * @dev This function can be called any time, it won't revert if assertion has not been settled.
    //  * @return assertion the full assertion object.
    //  */
    // function getAssertionData(bytes calldata _assertionId) public view returns (OptimisticOracleV3Interface.Assertion memory) {
    //     return _oov3.getAssertion(_assertionId);
    // }


    
    // ========================================
    //     HELPER FUNCTIONS
    // ========================================

    function createFinalClaimAssembly(
        bytes memory claim,
        bytes memory lensPostId
    ) private pure returns (bytes memory) {
        bytes memory mergedBytes = new bytes(claim.length + lensPostId.length);

        assembly {
            let length1 := mload(claim)
            let length2 := mload(lensPostId)
            let dest := add(mergedBytes, 32) // Skip over the length field of the dynamic array

            // Copy claim to mergedBytes
            for {
                let i := 0
            } lt(i, length1) {
                i := add(i, 32)
            } {
                mstore(add(dest, i), mload(add(claim, add(32, i))))
            }

            // Copy lensPostId to mergedBytes
            for {
                let i := 0
            } lt(i, length2) {
                i := add(i, 32)
            } {
                mstore(
                    add(dest, add(length1, i)),
                    mload(add(lensPostId, add(32, i)))
                )
            }

            mstore(mergedBytes, add(length1, length2))
        }

        return mergedBytes;
    }


}