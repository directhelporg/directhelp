import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { callContractWriteFunction } from '/api/multibaas';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

Meteor.methods({
  async 'approveAgent'(agentAddress) {
    check(agentAddress, String);
    return callContractWriteFunction(
      DirectHelp,
      'agentApprove',
      [agentAddress, 100],
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
  async 'submitRequest'(address, description, households) {
    check(address, String);
    check(description, String);
    check(households, Match.Integer);
    return callContractWriteFunction(
      DirectHelp,
      'serverInitiateFundRequest',
      [address, description, households],
    );
  },
  async 'settleRequest'(assertionId) {
    check(assertionId, String);
    return callContractWriteFunction(
      DirectHelp,
      'serverSettleAssertion',
      [assertionId],
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
