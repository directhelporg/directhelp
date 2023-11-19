//This script deploys the ERC20Votes contract to the Goerli testnet
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import hre from 'hardhat';
import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployOptions, DeployResult} from "hardhat-multibaas-plugin-v6/lib/type-extensions";
import {BaseContract} from "ethers";
import {getSystemConfig} from "../utils/systemConfig";

dotenv.config();

async function main() {
	const systemConfig = await getSystemConfig();

	const contract = await ethers.deployContract("EASRegisterer", [
		systemConfig.easRegistry,
		systemConfig.easSchemaRegistry
	]);
	const deployContractAddress = await contract.getAddress();

	console.log("Contract address:", deployContractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
