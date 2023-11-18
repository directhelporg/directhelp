//This script deploys the ERC20Votes contract to the Goerli testnet
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import hre from 'hardhat';
import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployOptions, DeployResult} from "hardhat-multibaas-plugin-v6/lib/type-extensions";
import {BaseContract} from "ethers";


//// Deploy commands:
// npx hardhat run scripts/deploy.ts --network sepolia
// npx hardhat run scripts/deploy.ts --network arbitrumGoerli
// npx hardhat run scripts/deploy.ts --network baseGoerli
// npx hardhat run scripts/deploy.ts --network chiado
// npx hardhat run scripts/deploy.ts --network linea
// npx hardhat run scripts/deploy.ts --network scrollSepolia
// npx hardhat run scripts/deploy.ts --network mantleTestnet
// npx hardhat run scripts/deploy.ts --network alfajores


// npx hardhat verify --network chiado 0x123a40a856d4a009Bb709c7828355C8Bc7309b57 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 200 0xAfAE2dD69F115ec26DFbE2fa5a8642D94D7Cd37E
// npx hardhat verify --network linea 0x82C993811B40609c5Dc3380E7Eb8c4BcAc42D46c 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 200 0xAfAE2dD69F115ec26DFbE2fa5a8642D94D7Cd37E
// npx hardhat verify --network alfajores 0x509f25ab47607B5490561CC5053071a79E83D836 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 200 0xAfAE2dD69F115ec26DFbE2fa5a8642D94D7Cd37E



dotenv.config();

async function main() {
	const uma_address = "0x1F4dC6D69E3b4dAC139E149E213a7e863a813466"; // BASE Goerli UMA contract
	const dispute_time = 200;
	const currency = "0xEF8b46765ae805537053C59f826C3aD61924Db45"; // BASE Goerli WETH ERC20 
	const eas_address = "0x4200000000000000000000000000000000000021"

	const contractVersion = "1.2.12";

	let contract: BaseContract;

	if(process.env.DEPLOY_MULTIBAAS) {
		contract = await deployWithMB(
			"Help",
			contractVersion,
			[uma_address, dispute_time, currency, eas_address],
			(await ethers.getSigners())[0]);
	}
	if(hre.network.name != "mantleTestnet") {
		contract = await ethers.deployContract("Help", [uma_address, dispute_time, currency, eas_address]);
	} else {
		contract = await ethers.deployContract("Help", [uma_address, dispute_time, currency, eas_address], {gasLimit: 10000000});
	}

	const deployContractAddress = await contract.getAddress();
	console.log("Contract address:", deployContractAddress);
	console.log("To verify execute the command below:");
	console.log("npx hardhat verify --network " + hre.network.name + " " + deployContractAddress + " " + uma_address + " " + dispute_time + " " + currency + " " + eas_address);
}

async function deployWithMB(
	contractName: string,
	contractVersion: string,
	args: any[],
	signer: SignerWithAddress,
): Promise<BaseContract> {
	await hre.mbDeployer.setup();

	console.log("Deploying through MB");

	let deployment = await hre.mbDeployer.deploy(
		signer as SignerWithAddress,
		contractName,
		args,
		{
			addressLabel: "help_sc_address",
			contractVersion,
			contractLabel: contractName.toLowerCase(),
		}
	);

	// Temporary fix for link update
	/*
	const linkResult = await hre.mbDeployer.link(
		signer as SignerWithAddress,
		contractName,
		await deployment.contract.getAddress(),
	);
	 */

	return deployment.contract;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
