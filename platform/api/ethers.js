import { ethers } from 'ethers';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

function getProvider() {
  try {
    if (Meteor.isClient) {
      return new ethers.providers.Web3Provider(window.ethereum);
    } else {
      return new ethers.providers.JsonRpcProvider(Meteor.settings.rpcUrl);
    }
  } catch (e) {
    console.warn('No ethereum provider found');
    return null;
  }
}

export function getSigner() {
  if (Meteor.isClient) {
    return getProvider()?.getSigner();
  } else {
    return new ethers.Wallet(Meteor.settings.signer);
  }
}

export const Accounts = {
  connected: new ReactiveVar([]),
  current: new ReactiveVar(),
  isConnected() {
    return Boolean(this.connected.get()?.length > 0);
  },
  async init() {
    const accounts = await getProvider()?.listAccounts();
    if (accounts) {
      this.connected.set(accounts);
      if (accounts.length > 0) {
        this.current.set(accounts[0]);
      }
    }
  },
  async connect() {
    const accounts = await getProvider()?.send('eth_requestAccounts', []);
    if (accounts) {
      this.connected.set(accounts);
      if (accounts.length > 0) {
        this.current.set(accounts[0]);
      }
    }
  },
};

Meteor.startup(async () => {
  const provider = getProvider();
  if (provider) {
    const { chainId } = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    console.log(`Ethers is connected to #${chainId}, the latest block is #${blockNumber}`);
  } else {
    console.warn('Ethers is not detected');
  }
});
