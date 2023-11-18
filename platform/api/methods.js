import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { callContractWriteFunction } from '/api/multibaas';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

Meteor.methods({
  async 'approveAgent'(agentAddress) {
    check(agentAddress, String);
    return callContractWriteFunction(
      DirectHelp,
      'agentApprove',
      [agentAddress],
    );
  },
  async 'rejectAgent'(agentAddress) {
    check(agentAddress, String);
    return callContractWriteFunction(
      DirectHelp,
      'agentReject',
      [agentAddress],
    );
  },
  async 'challengeRequest'(assertionId) {
    check(assertionId, String);
    return callContractWriteFunction(
      DirectHelp,
      'challengeFundRequest',
      [assertionId],
    );
  },
});
