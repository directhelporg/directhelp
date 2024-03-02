import { TemplateController } from 'meteor/space:template-controller';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { showError } from 'meteor/imajus:bootstrap-helpers';
import { Web3Accounts } from 'meteor/majus:web3';
import './home.html';

TemplateController('Home', {
  events: {
    async 'click [data-action=connectWallet]'() {
      try {
        await Web3Accounts.connect();
        FlowRouter.go('Register');
      } catch (err) {
        showError(err);
      }
    },
  },
});
