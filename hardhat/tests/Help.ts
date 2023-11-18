import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import {getSystemConfig} from "../utils/systemConfig";
import {expect} from "chai";

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

    return {
			systemConfig,
			help,
			owner,
			otherAccount };
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
      const { systemConfig, help, owner, otherAccount } = await loadFixture(deployContract);

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
      const { systemConfig, help, owner, otherAccount } = await loadFixture(deployContract);

			await help.connect(otherAccount).agentRegister("Name", "Location", 100_000);
			await help.agentApprove(otherAccount.address);

			const trx = await help.agentInitateFundRequest(
				"Some disaster",
				"50000"
			);

			expect(trx).to.emit(help, "RequestInitiated");
/*
			await time.increase(10);

			await help.serverSettleAssertion();
			const assertResult = await oov3.getAssertionResult();

			expect(agentData).to.deep.equal([
				otherAccount.address,
				"Name",
				"Location",
				BigInt(100_000),
				BigInt(1),
			]);*/
    });
  });
});
