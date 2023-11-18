import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import {getSystemConfig} from "../utils/systemConfig";
import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployResult} from "hardhat-multibaas-plugin/lib/type-extensions";

declare const hre: HardhatRuntimeEnvironment;

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

		await deployWithMB(
			"Help",
			[
				systemConfig.currency,
				0,
				systemConfig.currency,
			],
			owner, hre);

    return { systemConfig, help, owner, otherAccount };
  }

	async function deployWithMB(
		contractName: string,
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
				addressLabel: "greeter",
				contractVersion: "1.0",
				contractLabel: "greeter",
			}
		);
	}

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const { systemConfig, help } = await loadFixture(deployContract);

      expect(await help.getAddress()).to.be.an("string");
    });
  });
});
