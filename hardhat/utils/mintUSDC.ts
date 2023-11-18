//import { ethers } from "hardhat";
import {ZeroAddress} from "ethers";
import hre from "hardhat";
import bigintConversion from "bigint-conversion";
import {IERC20} from "../typechain-types";

//const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"
const usdcAddress = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"

// the slot must be a hex string stripped of leading zeros! no padding!
// https://ethereum.stackexchange.com/questions/129645/not-able-to-set-storage-slot-on-hardhat-network
const ownerSlot = "0x0";

function getSlot(userAddress: string, mappingSlot: number|undefined) {
	return hre.ethers.solidityPackedKeccak256(
		["uint256", "uint256"],
		[userAddress, mappingSlot]
	)
}

async function checkSlot(erc20: IERC20, mappingSlot: number|undefined, userAddress: string) {
	const contractAddress = await erc20.getAddress();

	// the slot must be a hex string stripped of leading zeros! no padding!
	// https://ethereum.stackexchange.com/questions/129645/not-able-to-set-storage-slot-on-hardhat-network
	const balanceSlot = getSlot(userAddress, mappingSlot)

	// storage value must be a 32 bytes long padded with leading zeros hex string
	const value: bigint = BigInt(0xDEADBEEF);
	const storageValue = hre.ethers.hexlify(
		hre.ethers.zeroPadValue(bigintConversion.bigintToBuf(value) as Uint8Array, 32)
	);

	await hre.network.provider.send(
		"hardhat_setStorageAt",
		[
			contractAddress,
			balanceSlot,
			storageValue
		]
	);

	// console.log(`Balance ${userAddress}:`, await erc20.balanceOf(userAddress), value);

	return await erc20.balanceOf(userAddress) == value;
}

async function findBalanceSlot(erc20: IERC20, userAddress: string) {
	const snapshot = await hre.network.provider.send("evm_snapshot");

	for (let slotNumber = 0; slotNumber < 100; slotNumber++) {
		try {
			if (await checkSlot(erc20, slotNumber, userAddress)) {
				await hre.network.provider.send("evm_revert", [snapshot])
				return slotNumber
			}
		} catch { }
		await hre.network.provider.send("evm_revert", [snapshot])
	}
}

/** Set address USDC balance */
export async function setUSDCBalance(usdc: IERC20, userAddress: string, amount: number) {
	const [signer] = await hre.ethers.getSigners();
	const signerAddress = await signer.getAddress();

	// automatically find mapping slot
	const mappingSlot = await findBalanceSlot(usdc, userAddress);
	// console.log("Found USDC.balanceOf slot: ", mappingSlot)

	// calculate balanceOf[signerAddress] slot
	const signerBalanceSlot = getSlot(userAddress, mappingSlot)

	// set it to the value
	const value = hre.ethers.parseUnits(amount.toString(), 18);

	/*
	console.log({
		z1: value,
		z2: bigintConversion.bigintToBuf(value) as Uint8Array,
		z9: hre.ethers.zeroPadValue(bigintConversion.bigintToBuf(value) as Uint8Array, 32)
	});
	 */

	await hre.ethers.provider.send(
		"hardhat_setStorageAt",
		[
			await usdc.getAddress(),
			signerBalanceSlot,
			hre.ethers.hexlify(
				hre.ethers.zeroPadValue(bigintConversion.bigintToBuf(value) as Uint8Array, 32))
		]
	)
}