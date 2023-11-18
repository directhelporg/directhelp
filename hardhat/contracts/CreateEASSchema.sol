// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

// EAS
import "./interfaces/EAS/ISchemaRegistry.sol";

contract EASSchemaReg is AccessControl {
	ISchemaRegistry public immutable EAS_SCHEMA_REGISTRY;
	bytes32 public EAS_SCHEMA_UID;

	constructor(
		address easSchemaRegistry
	) {
		console.log("Initializing UtilityStorage");
		//owner = msg.sender;
		
		EAS_SCHEMA_REGISTRY = ISchemaRegistry(easSchemaRegistry);
		
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
}
