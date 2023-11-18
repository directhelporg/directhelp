//This script deploys the ERC20Votes contract to the Goerli testnet
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployOptions, DeployResult} from "hardhat-multibaas-plugin-v6/lib/type-extensions";


// to deploy use:
// npx hardhat run scripts/deploy.ts --network goerli
// npx hardhat run scripts/deploy.ts --network alfajores
// npx hardhat run scripts/deploy.ts --network linea
// npx hardhat run scripts/deploy.ts --network chiado
// npx hardhat run scripts/deploy.ts --network baseGoerli
// npx hardhat run scripts/deploy.ts --network arbitrumGoerli
// npx hardhat run scripts/deploy.ts --network mantleTestnet

// no funds:
// npx hardhat run scripts/deploy.ts --network scrollSepolia


// npx hardhat verify --network scroll 0x04b3786899D4400bBEf2f000c07CBB916a9a8E24 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 200 0xAfAE2dD69F115ec26DFbE2fa5a8642D94D7Cd37E
// npx hardhat verify --network mantleTestnet 0x88403E5719295B76a1A456b9B2665aCDA9AD4943 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 200 0xAfAE2dD69F115ec26DFbE2fa5a8642D94D7Cd37E
dotenv.config();

declare const hre: HardhatRuntimeEnvironment;

async function main() {
  let contract;
  try {
		const args = ["0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", 200, "0xAfAE2dD69F115ec26DFbE2fa5a8642D94D7Cd37E"];

		if(!process.env.DEPLOY_MULTIBAAS) {
			contract = await ethers.deployContract("Help", args);
		} else {
			contract = await deployWithMB(
				"Help",
				"1.2.9",
				args,
				(await ethers.getSigners())[0], hre);
		}
	}
  catch (error) {
		// Should not get into mantleTestnet"
		throw new Error(`Deployment error: ${error.message}`);
  }

  console.log("Contract address:", await contract?.getAddress());
}


async function deployWithMB(
	contractName: string,
	contractVersion: string,
	args: any[],
	signer: SignerWithAddress,
	hre: HardhatRuntimeEnvironment
): Promise<DeployResult> {
	await hre.mbDeployer.setup();

	console.log("Deploying through MB");

	let deployment: DeployResult;

	try {
		deployment = await hre.mbDeployer.deploy(
			signer as SignerWithAddress,
			contractName,
			args,
			{
				addressLabel: "help_sc_address",
				contractVersion,
				contractLabel: contractName.toLowerCase(),
			}
		);
	} catch(ex) {
		console.error(`Error doing mbDeployment: ${ex.message}`);
	}

	// Temporary fix for link update
	const linkResult = await hre.mbDeployer.link(
		signer as SignerWithAddress,
		contractName,
		await deployment.contract.getAddress(),
	);
	console.log("Link result:");
	console.log(linkResult);

	return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  // 0x388615CDF39FE5934Ac05AcFf2bbB86DB933CcB7
