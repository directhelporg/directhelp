//This script deploys the ERC20Votes contract to the Goerli testnet
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployResult} from "hardhat-multibaas-plugin/lib/type-extensions";


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
			await deployWithMB(
				"Help",
				"1.2.4",
				args,
				(await ethers.getSigners())[0], hre);
		}
	}
  catch (error) {
    // In case of error try with specific config for mantleTestnet
    try {contract = await ethers.deployContract("Help", ["0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", 200, "0xAfAE2dD69F115ec26DFbE2fa5a8642D94D7Cd37E"], { gasLimit: 10000000});}
    catch (error) {
      console.error('An error occurred during contract deployment:', error);
      process.exit(1); // Exit with an error code
  }
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

	return hre.mbDeployer.deploy(
		signer as SignerWithAddress,
		contractName,
		args,
		{
			addressLabel: "help_sc_address",
			contractVersion,
			contractLabel: contractName.toLowerCase(),
		}
	);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  // 0x388615CDF39FE5934Ac05AcFf2bbB86DB933CcB7
