import { ethers } from 'ethers';
import { Meteor } from 'meteor/meteor';

export const Provider = new ethers.providers.Web3Provider(window.ethereum);

Meteor.startup(async () => {
  const { chainId } = await Provider.getNetwork();
  const blockNumber = await Provider.getBlockNumber();
  console.log(`Ethers is connected to #${chainId}, the latest block is #${blockNumber}`);
});
