import { Meteor } from 'meteor/meteor';
import { Web3Factory } from 'meteor/majus:web3';

Meteor.startup(async () => {
  const provider = Web3Factory.provider();
  if (provider) {
    const { chainId } = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    console.log(
      `Ethers is connected to #${chainId}, the latest block is #${blockNumber}`,
    );
  } else {
    console.warn('Ethers is not detected');
  }
});
