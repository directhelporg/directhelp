import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import {getSystemConfig} from "../utils/systemConfig";
import {ZeroAddress} from "ethers";

describe("Lock", function () {
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
			systemConfig.currency,
		);

    return { systemConfig, help, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const { systemConfig, help } = await loadFixture(deployContract);

      expect(await help.getAddress()).to.be.an("string");
    });

		it("Should add agent", async function () {
      const { systemConfig, help } = await loadFixture(deployContract);

			const agent = ethers.Wallet.createRandom();

			help.connect(agent).agentRegister("Name", "Location");
			const agentData = await help.agents(agent.address);
			const agentData2 = await help.getAgent(agent.address);

			console.log(agentData);
			console.log(agentData2);

      expect(await help.getAddress()).to.be.an("string");
    });
  });
});
