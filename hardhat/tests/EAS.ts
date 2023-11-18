import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import {getSystemConfig} from "../utils/systemConfig";

describe("EAS", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

		const systemConfig = await getSystemConfig();

		// console.log(`Deploying with EAS Register: ${systemConfig.easSchemaRegistry}`);


		console.log(systemConfig);
    const EASRegisterer = await ethers.getContractFactory("EASRegisterer");
    const easRegisterer = await EASRegisterer.deploy(
			systemConfig.easRegistry,
			systemConfig.easSchemaRegistry
		);
		console.log(2);

    return { systemConfig, easRegisterer, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy and register schema", async function () {
      const { systemConfig, easRegisterer } = await loadFixture(deployContract);

      expect(await easRegisterer.getAddress()).to.be.an("string");
      expect(await easRegisterer.EAS_SCHEMA_UID()).to.be.an("string");
    });

		it("Should attest", async function () {
      const { easRegisterer, otherAccount } = await loadFixture(deployContract);

			const attestation = await easRegisterer.fundApproveAgent(
				otherAccount.address,
				true,
				20_000
			);

			// console.log(await easRegisterer.recentAttestationId());

			expect(await easRegisterer.recentAttestationId()).to.be.an("string");
    });
  });
});
