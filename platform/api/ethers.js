import { ethers } from 'ethers';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

export const Provider = new ethers.providers.Web3Provider(window.ethereum);

export const Accounts = {
  connected: new ReactiveVar([]),
  get current() {
    const [account] = this.connected.get() ?? [];
    return account;
  },
  isConnected() {
    return Boolean(this.connected.get()?.length > 0);
  },
  async init() {
    const accounts = await Provider.listAccounts();
    this.connected.set(accounts);
  },
  async connect() {
    const accounts = await Provider.send('eth_requestAccounts', []);
    this.connected.set(accounts);
  },
};

Meteor.startup(async () => {
  const { chainId } = await Provider.getNetwork();
  const blockNumber = await Provider.getBlockNumber();
  console.log(`Ethers is connected to #${chainId}, the latest block is #${blockNumber}`);
});
