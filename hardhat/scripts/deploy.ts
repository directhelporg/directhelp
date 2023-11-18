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
	const arg1 = "0x1F4dC6D69E3b4dAC139E149E213a7e863a813466"; // BASE Goerli UMA contract
	const arg2 = 200;
	const arg3 = "0x2e668Bb88287675e34c8dF82686dfd0b7F0c0383"; // BASE Goerli USDC ERC20 

	const contractVersion = "1.2.12";

	let contract: BaseContract;

	if(process.env.DEPLOY_MULTIBAAS) {
		contract = await deployWithMB(
			"Help",
			contractVersion,
			[arg1, arg2, arg3],
			(await ethers.getSigners())[0]);
	}
	if(hre.network.name != "mantleTestnet") {
		contract = await ethers.deployContract("Help", [arg1, arg2, arg3]);
	} else {
		contract = await ethers.deployContract("Help", [arg1, arg2, arg3], {gasLimit: 10000000});
	}

	const deployContractAddress = await contract.getAddress();
	console.log("Contract address:", deployContractAddress);
	console.log("To verify execute the command below:");
	console.log("npx hardhat verify --network " + hre.network.name + " " + deployContractAddress + " " + arg1 + " " + arg2 + " " + arg3);
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
