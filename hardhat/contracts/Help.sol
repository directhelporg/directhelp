// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {OptimisticOracleV3Interface} from "./interfaces/OptimisticOracleV3Interface.sol";
import "hardhat/console.sol";

// EAS
import "./interfaces/EAS/ISchemaRegistry.sol";
import "./interfaces/EAS/IEAS.sol";

contract Help is Ownable {
    OptimisticOracleV3Interface private immutable _oov3;
    uint64 public defaultLiveness;
    IERC20 public defaultCurrency;
    bytes32 private constant _defaultIdentifier = "ASSERT_TRUTH";

	IEAS public immutable EAS;
	bytes32 public EAS_SCHEMA_UID = 0x4dcb06ee3e314aa247dcd32a1ffa1f0b357f6a659b922aac7482f079e88bb873;
    
    bytes32 public recentAttestationId;

    enum AgentStatus {
        Unapproved,
        Approved,
        Suspended
    }

    enum RequestStatus {
        Pending,
        Approved,
        Challenged,
        Rejected
    }

    struct Agent {
        address agentAddress;
        string name;
        string location;
        uint64 households;
        uint64 householdBudget;
        AgentStatus status;
    }
  
    struct AgentAssertion {
      address agent;
      uint256 householdsAffected;
      bool resolved;
      bool assertedTruthfully;
    }

    mapping(address => Agent) public agents;
    mapping(bytes32 => AgentAssertion) public agentAssertions;
	
		// All disputed assertions (simulation for the test network)
    mapping(bytes32 => address) public disputedAssertions;
	
	  bytes32 public recentAssertionId;
		uint256 public minimalBond;

    
    // ========================================
    //     EVENTS
    // ========================================

    event AgentRegistered(address indexed agentAddress, string name, string location, uint64 households);
    event AgentApproved(address indexed agentAddress, uint64 householdBudget);
    event AgentSuspended(address indexed agentAddress, uint64 householdBudget);
    event AgentPaid(address agent, uint256 householdsAffected, uint256 householdBudget, uint256 total);

    event RequestInitiateBegin(address indexed agentAddress, bytes32 indexed assertionId);
    event RequestInitiated(address indexed agentAddress, bytes32 indexed assertionId);
    event RequestApproved(address indexed agentAddress, bytes32 indexed assertionId);
    event RequestChallenged(address indexed agentAddress, bytes32 indexed assertionId);
    event RequestRejected(address indexed agentAddress, bytes32 indexed assertionId);
    event RequestSettled(address indexed agentAddress, bytes32 indexed assertionId, bool result);
    event RequestResult(address indexed agentAddress, bytes32 indexed assertionId, bool result);

    // ========================================
    //     CONSTRUCTOR AND CORE FUNCTIONS
    // ========================================

    /**
     * @notice Constructs the Help contract.
     * @param _currency the currency to use for assertions.
     * @param _liveness the liveness to use for assertions.
     * @param __oov3 the address of the OptimisticOracleV3 contract.
     */
    constructor(IERC20 _currency, uint64 _liveness, address __oov3, address _eas)
		Ownable(msg.sender) {
        EAS = IEAS(_eas);

        defaultCurrency = _currency;
        defaultLiveness = _liveness;
        _oov3 = OptimisticOracleV3Interface(__oov3);
    }

    // ========================================
    //     AGENT FUNCTIONS
    // ========================================


    function agentRegister(string memory _name, string memory _location, uint64 _households) public {
        require(agents[msg.sender].agentAddress == address(0), "Agent already registered");
        agents[msg.sender] = Agent(msg.sender, _name, _location, _households, 0, AgentStatus.Unapproved);
        emit AgentRegistered(msg.sender, _name, _location, _households);
    }

    function agentApprove(address _agentAddress, uint64 householdBudget) public
    // onlyOwner
    {
        require(agents[_agentAddress].agentAddress != address(0), "Agent not registered");
        _attestAgent(_agentAddress, agents[_agentAddress].households);
        agents[_agentAddress].status = AgentStatus.Approved;
        agents[_agentAddress].householdBudget = householdBudget;
        emit AgentApproved(_agentAddress, householdBudget);
    }

    function agentSuspend(address _agentAddress) public
    // onlyOwner
    {
        require(agents[_agentAddress].agentAddress != address(0), "Agent not registered");
        agents[_agentAddress].status = AgentStatus.Suspended;
        agents[_agentAddress].householdBudget = 0;
        emit AgentSuspended(_agentAddress, agents[_agentAddress].householdBudget);
    }

    function getAgent(address _agentAddress) public view returns (Agent memory) {
        return agents[_agentAddress];
    }

    function getAgentStatus(address _agentAddress) public view returns (AgentStatus) {
        return agents[_agentAddress].status;
    }

    // ========================================
    //     UMA FUNCTIONS
    // ========================================

    function agentInitateFundRequest(string memory _disasterDescription, string memory _householdsAffected) public
    returns (bytes32)
    {
        // Comment out for testing purposes
        // require(agents[msg.sender].agentAddress != address(0), "Agent not registered");
        
        // todo: check is request is within budget
        // todo: check if another request is pending
			
      bytes memory claim = createFinalClaimAssembly(
        bytes(_disasterDescription),
        bytes(_householdsAffected)
      );
			
			minimalBond = _oov3.getMinimumBond(address(defaultCurrency));
			defaultCurrency.approve(address(_oov3), minimalBond);
			
			//console.log("B4 assertTruth, currency: %s", address(defaultCurrency));
      recentAssertionId = _oov3.assertTruth(
          claim,
          address(this), // asserter
          address(0), // callbackRecipient
          address(0), // escalationManager
          defaultLiveness,
          defaultCurrency,
					minimalBond,
          _defaultIdentifier,
          bytes32(0) // domainId
      );
			
			emit RequestInitiated(msg.sender, recentAssertionId);
			return recentAssertionId;
    }
  
  
    function serverInitiateFundRequest(address _agent, string memory _disasterDescription, uint256 _householdsAffected) public
    returns (bytes32)
    {
      require(agents[_agent].agentAddress != address(0), "Agent not registered");
        
        // todo: check is request is within budget
        // todo: check if another request is pending
      
      emit RequestInitiateBegin(_agent, recentAssertionId);
      
      bytes memory claim = createFinalClaimAssembly(
        bytes(_disasterDescription),
        bytes(Strings.toString(_householdsAffected))
      );
			
			minimalBond = _oov3.getMinimumBond(address(defaultCurrency));
			defaultCurrency.approve(address(_oov3), minimalBond * 5);
			
			//console.log("B4 assertTruth, currency: %s", address(defaultCurrency));
      recentAssertionId = _oov3.assertTruth(
          claim,
          address(this), // asserter
          address(this), // callbackRecipient
          address(0), // escalationManager
          defaultLiveness,
          defaultCurrency,
					minimalBond,
          _defaultIdentifier,
          bytes32(0) // domainId
      );
      
      agentAssertions[recentAssertionId] = AgentAssertion(
        _agent,
        _householdsAffected,
        false,
        false
      );
			
			emit RequestInitiated(_agent, recentAssertionId);
			return recentAssertionId;
    }

    function serverSettleAssertion(bytes32 _assertionId) external returns (bool) {
        // todo: check if assertionId is not valid
			
				// Simulate disputed assertion
				if(disputedAssertions[_assertionId] != address(0)) {
					return false;
				}
		
				bool result = _oov3.settleAndGetAssertionResult(_assertionId);
        return result;
    }
    
    /** A callback from UMA when assertion is resolved */
    function assertionResolvedCallback(bytes32 _assertionId, bool assertedTruthfully) public {
      console.log("Assertion has arrived:", assertedTruthfully);
      
      agentAssertions[_assertionId].resolved = true;
      agentAssertions[_assertionId].assertedTruthfully = assertedTruthfully;
      
      AgentAssertion memory agentAssertion = agentAssertions[_assertionId];
      
      if(assertedTruthfully) {
        uint256 householdBudget = agents[agentAssertion.agent].householdBudget;
        uint256 total = householdBudget * agentAssertion.householdsAffected;
        
        console.log("Paying agent %s %s",
          agentAssertion.agent, total
        );
        console.log("(%s households, %s per household)",
          Strings.toString(agentAssertion.householdsAffected),
          Strings.toString(householdBudget)
        );
        
        _payAgent(
          agentAssertion.agent,
          total * 1e18
        );
        emit AgentPaid(
          agentAssertion.agent,
          agentAssertion.householdsAffected,
          householdBudget,
          total
        );
      }
      
      emit RequestSettled(agentAssertion.agent, _assertionId, assertedTruthfully);
    }
  
  /**
   * @notice Returns the result of the assertion.
     * @param _assertionId the assertionId of the claim.
     * @dev This function can only be called once the assertion has been settled, otherwise it reverts.
     * @return result the result of the assertion (true/false).
     */
    function getAssertionResult(bytes32 _assertionId) public view returns (bool) {
			// Simulate disputed assertion
			if(disputedAssertions[_assertionId] != address(0)) {
				return false;
			}
			
			return _oov3.getAssertionResult(_assertionId);
    }

    /**
     * @notice Returns the full assertion object contain all information associated with the assertion.
     * @param _assertionId the assertionId of the claim.
     * @dev This function can be called any time, it won't revert if assertion has not been settled.
     * @return assertion the full assertion object.
     */
    function getAssertionData(bytes32 _assertionId) public view returns (OptimisticOracleV3Interface.Assertion memory) {
        return _oov3.getAssertion(_assertionId);
    }
	
	  /**
	  * Dispute assertion manually
	  */
		function challengeFundRequest(bytes32 _assertionId) public {
			defaultCurrency.approve(address(_oov3), minimalBond);
			_oov3.disputeAssertion(_assertionId, address(this));
			
			// Simulate disputed assertion
			disputedAssertions[_assertionId] = address(this);
		}
  
  // "USCD" payments and balance retrieval
  function getCurrencyBalance() public view returns (uint256) {
    return defaultCurrency.balanceOf(address(this));
  }
    
    // ========================================
    //     EAS FUNCTIONS
    // ========================================

	function _attestAgent(
		address _agentAddress,
		uint256 _householdBudget
	) internal returns (bytes32) {
		bytes memory data = abi.encode(
			_agentAddress,
			// Name here
            agents[_agentAddress].name,
            agents[_agentAddress].location,
			_householdBudget
		);
		
		AttestationRequestData memory requestData = AttestationRequestData(
			_agentAddress,
			0,
			false,
			bytes32(0),
			data,
			0
		);
		
		AttestationRequest memory request = AttestationRequest(
			EAS_SCHEMA_UID,
			requestData
		);
		
		recentAttestationId = EAS.attest(request);
		return recentAttestationId;
	}

    function _payAgent(address agent, uint256 amount) internal {
      defaultCurrency.transfer(agent, amount);
    }

    // ========================================
    //     HELPER FUNCTIONS
    // ========================================

    function createFinalClaimAssembly(
        bytes memory _disasterDescription,
        bytes memory _householdsAffected
    ) private pure returns (bytes memory) {
        bytes memory mergedBytes = new bytes(_disasterDescription.length + _householdsAffected.length);

        assembly {
            let length1 := mload(_disasterDescription)
            let length2 := mload(_householdsAffected)
            let dest := add(mergedBytes, 32) // Skip over the length field of the dynamic array

            // Copy _disasterDescription to mergedBytes
            for {
                let i := 0
            } lt(i, length1) {
                i := add(i, 32)
            } {
                mstore(add(dest, i), mload(add(_disasterDescription, add(32, i))))
            }

            // Copy _householdsAffected to mergedBytes
            for {
                let i := 0
            } lt(i, length2) {
                i := add(i, 32)
            } {
                mstore(
                    add(dest, add(length1, i)),
                    mload(add(_householdsAffected, add(32, i)))
                )
            }

            mstore(mergedBytes, add(length1, length2))
        }

        return mergedBytes;
    }


}
