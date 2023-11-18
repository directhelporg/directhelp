// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

// EAS
import "./interfaces/EAS/ISchemaRegistry.sol";
import "./interfaces/EAS/IEAS.sol";

contract EASRegisterer is AccessControl {
	IEAS public immutable EAS;
	ISchemaRegistry public immutable EAS_SCHEMA_REGISTRY;
	bytes32 public EAS_SCHEMA_UID;
    
    bytes32 public recentAttestationId;

	constructor(
		address _eas,
		address _easSchemaRegistry
	) {
		//owner = msg.sender;
		
		EAS = IEAS(_eas);
		EAS_SCHEMA_REGISTRY = ISchemaRegistry(_easSchemaRegistry);
		
		_registerEasSchema_v1();
	}
	
	function _registerEasSchema_v1() internal {
		console.log("Registering EAS Schema v1");
		
		EAS_SCHEMA_UID = EAS_SCHEMA_REGISTRY.register(
			"address agent, string name, string location, uint256 households",
			ISchemaResolver(address(0)),
			true
		);
	}
	
	function fundApproveAgent(
		address _agent,
		bool _approved,
		uint256 _householdBudget
	) external returns (bytes32 id) {
		console.log("fundApproveAgent entry");
		
		console.log("Proceeding to attestation");
		id = _attestAgent(_agent, _householdBudget);
		console.log("Attestation done");

    recentAttestationId = id;
		
		return id;
	}
	
	/*
	function testGetAttestation(address _agent) external view returns (bytes32) {
		bytes32 attestationResult = EAS.getAttestation(
			EAS_SCHEMA_UID,
			_agent
		);
		return attestationResult;
	}
	*/
	
	function _attestAgent(
		address _agent,
		uint256 _householdBudget
	) internal returns (bytes32) {
		bytes memory data = abi.encode(
			_agent,
			"Name here",
			"Location here",
			_householdBudget
		);
		
		AttestationRequestData memory requestData = AttestationRequestData(
			_agent,
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
		
		bytes32 attestationResult = EAS.attest(request);
		return attestationResult;
	}
}
