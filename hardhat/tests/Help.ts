import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import {getSystemConfig} from "../utils/systemConfig";
import {expect} from "chai";
import {setUSDCBalance} from "../utils/mintUSDC";
import {ERC20Mock} from "../typechain-types";

describe("Help", function () {
	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployContract() {
		// Contracts are deployed using the first signer/account by default
		const [owner, otherAccount] = await ethers.getSigners();

		const systemConfig = await getSystemConfig();

		const Help = await ethers.getContractFactory("Help");
		const help = await Help.deploy(
			systemConfig.currency,
			3, // seconds?
			systemConfig.oov3,
			systemConfig.easRegistry
		);

		// Add token balance for UMA
		const CurrencyToken = await ethers.getContractFactory("ERC20Mock");
		const currency = CurrencyToken.attach(systemConfig.currency) as ERC20Mock;
		await setUSDCBalance(currency, await help.getAddress(), 100_000);

		return {
			systemConfig,
			help,
			currency,
			owner,
			otherAccount,
		};
	}

	describe("Deployment", function() {
		it("Should deploy", async function() {
			const {help} = await loadFixture(deployContract);

			expect(await help.getAddress()).to.be.an("string");
		});

		it("Should have a balance", async function() {
			const {help} = await loadFixture(deployContract);

			const balance = await help.getCurrencyBalance();

			expect(balance).to.be.equal(BigInt("100000000000000000000000"));
		});

		it("Should add agent", async function() {
			const {systemConfig, help, owner, otherAccount} = await loadFixture(deployContract);

			await help.connect(otherAccount).agentRegister("Name", "Location", 100_000);
			const agentData = await help.agents(otherAccount.address);
			//console.log("Agent data:", agentData);

			expect(agentData).to.deep.equal([
				otherAccount.address,
				"Name",
				"Location",
				BigInt(100_000),
				BigInt(0),
				BigInt(0),
			]);
		});

		it("Should pass agentApproval", async function() {
			const {help, owner, otherAccount} = await loadFixture(deployContract);

			await help.connect(otherAccount).agentRegister("Name", "Location", 100_000);
			await help.agentApprove(otherAccount.address, 100_000);

			const agentData = await help.agents(otherAccount.address);
			//console.log("Agent data:", agentData);

			expect(agentData).to.deep.equal([
				otherAccount.address,
				"Name",
				"Location",
				BigInt(100_000),
				BigInt(100_000),
				BigInt(1),
			]);
		});

		it("Should pass UMA", async function() {
			const {currency, help, owner, otherAccount} = await loadFixture(deployContract);

			await help.connect(otherAccount).agentRegister("Name", "Location", 100_000);
			await help.agentApprove(otherAccount.address, 100_000);

			const origBalance = await currency.balanceOf(await help.getAddress());

			const trx = await help.agentInitateFundRequest(
				"Some disaster",
				"50000"
			);

			const recentAssertionId = await help.recentAssertionId();

			expect(trx).to.emit(help, "RequestInitiated");

			const newBalance = await currency.balanceOf(await help.getAddress());
			//console.log(`New balance: ${newBalance}`);
			expect(newBalance).to.be.lessThan(origBalance);

			await time.increase(10);

			await help.serverSettleAssertion(recentAssertionId);
			expect(await help.getAssertionResult(recentAssertionId)).to.be.true;
		});

		it("Should pass UMA from server", async function() {
			const {currency, help, owner, otherAccount} = await loadFixture(deployContract);

			const HOUSEHOLDS_AFFECTED = 50;
			const HOUSEHOLDS_BALANCE = 100;

			await help.connect(otherAccount).agentRegister("Name", "Location", HOUSEHOLDS_BALANCE);
			await help.agentApprove(otherAccount.address, HOUSEHOLDS_BALANCE);

			const origBalance = await currency.balanceOf(await help.getAddress()) /
				BigInt("1000000000000000000");
			console.log(`Original contract balance: ${origBalance}`);

			const trx = await help.serverInitiateFundRequest(
				otherAccount.address,
				"Some disaster happened somewhere",
				BigInt(HOUSEHOLDS_AFFECTED),
			);

			const recentAssertionId = await help.recentAssertionId();

			expect(trx).to.emit(help, "RequestInitiated");

			const newBalance = await currency.balanceOf(await help.getAddress()) /
				BigInt("1000000000000000000");
			//console.log(`New balance: ${newBalance}`);
			expect(newBalance).to.be.lessThan(origBalance);

			await time.increase(10);

			await help.serverSettleAssertion(recentAssertionId);
			expect(await help.getAssertionResult(recentAssertionId)).to.be.true;

			// Check records
			const assertionData = await help.agentAssertions(recentAssertionId);
			//console.log(assertionData);

			expect(assertionData).to.deep.equal([
				otherAccount.address,
				BigInt(HOUSEHOLDS_AFFECTED),
				true,
				true
			]);

			const agentBalance = (await currency.balanceOf(otherAccount.address)) /
				BigInt("1000000000000000000");
			console.log(`Agent balance: ${agentBalance}`);

			const contractBalance = (await currency.balanceOf(await help.getAddress())) /
				BigInt("1000000000000000000");
			console.log(`Contract balance: ${contractBalance}`);

			expect(agentBalance).to.be.equal(
				BigInt(HOUSEHOLDS_BALANCE * HOUSEHOLDS_AFFECTED));
			expect(contractBalance).to.be.equal(origBalance - BigInt(HOUSEHOLDS_BALANCE * HOUSEHOLDS_AFFECTED));
		});

		it("Should allow to dispute UMA", async function() {
			const {currency, help, owner, otherAccount} = await loadFixture(deployContract);

			await help.connect(otherAccount).agentRegister("Name", "Location", 100_000);
			await help.agentApprove(otherAccount.address, 100_000);

			await help.agentInitateFundRequest(
				"Some disaster",
				"50000"
			);
			const recentAssertionId = await help.recentAssertionId();

			await help.challengeFundRequest(recentAssertionId);

			await time.increase(10_000);
			await help.serverSettleAssertion(recentAssertionId);
			//const assertionData = await help.getAssertionData(recentAssertionId);
			//console.log(assertionData);

			expect(await help.getAssertionResult(recentAssertionId)).to.be.false;

		});
	});
});
