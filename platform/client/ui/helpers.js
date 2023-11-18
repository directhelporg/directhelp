import { Template } from 'meteor/templating';
import { Accounts } from '/api/ethers';

Template.helpers({
  'connectedAccounts': () => Accounts.connected.get(),
  'currentAccount': () => Accounts.current,
});
