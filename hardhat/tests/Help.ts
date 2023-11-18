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
				0,
				systemConfig.oov3,
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

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const { help } = await loadFixture(deployContract);

      expect(await help.getAddress()).to.be.an("string");
    });

		it("Should add agent", async function () {
      const { systemConfig, help, owner, otherAccount } = await loadFixture(deployContract);

			await help.connect(otherAccount).agentRegister("Name", "Location", 100_000);
			const agentData = await help.agents(otherAccount.address);
			//console.log("Agent data:", agentData);

      expect(agentData).to.deep.equal([
				otherAccount.address,
				"Name",
				"Location",
				BigInt(100_000),
				BigInt(0),
			]);
    });

		it("Should pass agentApproval", async function () {
      const { help, owner, otherAccount } = await loadFixture(deployContract);

			await help.connect(otherAccount).agentRegister("Name", "Location", 100_000);
			await help.agentApprove(otherAccount.address);

			const agentData = await help.agents(otherAccount.address);
			//console.log("Agent data:", agentData);

			expect(agentData).to.deep.equal([
				otherAccount.address,
				"Name",
				"Location",
				BigInt(100_000),
				BigInt(1),
			]);
    });

		it("Should pass UMA", async function () {
      const { currency, help, owner, otherAccount } = await loadFixture(deployContract);

			await help.connect(otherAccount).agentRegister("Name", "Location", 100_000);
			await help.agentApprove(otherAccount.address);

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
  });
});