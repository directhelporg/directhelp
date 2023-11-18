import { ethers } from 'ethers';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { prepateAndSubmitContractWriteFunction } from '/api/multibaas';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

// const BackendProvider = new ethers.providers.JsonRpcProvider(Meteor.settings.rpcUrl);
const BackendSigner = new ethers.Wallet(Meteor.settings.signer);

Meteor.methods({
  async 'approveAgent'(agentAddress) {
    check(agentAddress, String);
    return prepateAndSubmitContractWriteFunction(
      DirectHelp,
      'agentApprove',
      [agentAddress],
      BackendSigner,
    );
  },
  async 'rejectAgent'(agentAddress) {
    check(agentAddress, String);
    return prepateAndSubmitContractWriteFunction(
      DirectHelp,
      'agentReject',
      [agentAddress],
      BackendSigner,
    );
  },
});
