//This script deploys the ERC20Votes contract to the Goerli testnet
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import hre from 'hardhat';


//// Deploy commands:
// npx hardhat run scripts/deploy.ts --network sepolia 
// npx hardhat run scripts/deploy.ts --network arbitrumGoerli
// npx hardhat run scripts/deploy.ts --network baseGoerli
// npx hardhat run scripts/deploy.ts --network chiado
// npx hardhat run scripts/deploy.ts --network linea
// npx hardhat run scripts/deploy.ts --network scrollSepolia
// npx hardhat run scripts/deploy.ts --network mantleTestnet
// npx hardhat run scripts/deploy.ts --network alfajores


// npx hardhat verify --network arbitrumGoerli 0xE57bae05b7568E1b2b03104bD171ab94F54BcbFE 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 200 0xAfAE2dD69F115ec26DFbE2fa5a8642D94D7Cd37E

dotenv.config();

async function main() {
  const arg1 = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
  const arg2 = 200;
  const arg3 = "0xAfAE2dD69F115ec26DFbE2fa5a8642D94D7Cd37E";
  let contract;
  if (hre.network.name != "mantleTestnet") {
    contract = await ethers.deployContract("Help", [arg1, arg2, arg3]);
  } else {
    contract = await ethers.deployContract("Help", [arg1, arg2, arg3], { gasLimit: 10000000});
  }

  const deployContractAddress = await contract.getAddress();
  console.log("Contract address:", deployContractAddress);
  console.log("To verify execute the command below:");
  console.log("npx hardhat verify --network " + hre.network.name + " " + deployContractAddress + " " + arg1 + " " + arg2 + " " + arg3);


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });