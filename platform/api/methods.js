import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { prepateAndSubmitContractWriteFunction } from '/api/multibaas';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

Meteor.methods({
  async 'approveAgent'(agentAddress) {
    check(agentAddress, String);
    return prepateAndSubmitContractWriteFunction(
      DirectHelp,
      'agentApprove',
      [agentAddress],
    );
  },
  async 'rejectAgent'(agentAddress) {
    check(agentAddress, String);
    return prepateAndSubmitContractWriteFunction(
      DirectHelp,
      'agentReject',
      [agentAddress],
    );
  },
});
