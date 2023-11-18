import {ZeroAddress} from "ethers";
import {HardhatRuntimeEnvironment} from "hardhat/types";

declare const hre: HardhatRuntimeEnvironment;

export interface SystemConfig {
	// EAS registry contract address
	easRegistry: string;

	// EAS schema registry
	easSchemaRegistry: string;

	// OOV3 contract address
	oov3: string;
	// Currency being used
	currency: string;
}

export async function getSystemConfig(
	// hre: HardhatRuntimeEnvironment
): Promise<SystemConfig> {
	const chainId = await getChainId(hre);

	// console.log(`Chain ID: ${chainId}`);

	switch(chainId) {
		case 1:
			// Mainnet
			throw new Error(`Mainnet setup not implemented`);

		case -31337:
			// Optimism
			return {
				easRegistry: "0x4200000000000000000000000000000000000021",
				easSchemaRegistry: "0x4200000000000000000000000000000000000020",
				oov3: "0x072819Bb43B50E7A251c64411e7aA362ce82803B",
				currency: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC
			};

		case 31337:
			// Sepolia
			return {
				easRegistry: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
				easSchemaRegistry: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
				oov3: "",
				currency: "", // USDC
			}

		default:
			//throw new Error(`No addresses for chainId ${chainId}`);
			throw new Error(`No addresses for net ${chainId}`);
	}
}


async function getChainId(hre: HardhatRuntimeEnvironment): Promise<number> {
	const id: string = await hre.network.provider.send("eth_chainId");
	if (id === "0x") {
		return -1;
	}
	return parseInt(id, 16);
}
