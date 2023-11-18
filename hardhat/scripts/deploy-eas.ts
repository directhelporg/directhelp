//This script deploys the ERC20Votes contract to the Goerli testnet
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import hre from 'hardhat';
import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployOptions, DeployResult} from "hardhat-multibaas-plugin-v6/lib/type-extensions";
import {BaseContract} from "ethers";
import {getSystemConfig} from "../utils/systemConfig";


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
