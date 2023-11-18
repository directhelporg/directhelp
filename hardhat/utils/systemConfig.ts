import {ZeroAddress} from "ethers";
import {HardhatRuntimeEnvironment} from "hardhat/types";

declare const hre: HardhatRuntimeEnvironment;

export interface SystemConfig {
	// EAS registry contract address
	easRegistry: string;
	// OOV3 contract address
	oov3: string;
	// Currency being used
	currency: string;
}

export async function getSystemConfig(
	// hre: HardhatRuntimeEnvironment
): Promise<SystemConfig> {
	const chainId = await getChainId(hre);

	let addresses: SystemConfig = {
		easRegistry: ZeroAddress,
		oov3: ZeroAddress,
		currency: ZeroAddress,
	};

	console.log(`Using ChainId ${chainId}`);

	switch(chainId) {
		case 1:
			// Mainnet
			throw new Error(`Mainnet setup not implemented`);

		case 31337:
			// Optimism
			return {
				easRegistry: "0x4200000000000000000000000000000000000021",
				oov3: "0x072819Bb43B50E7A251c64411e7aA362ce82803B",
				currency: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC
			};

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
