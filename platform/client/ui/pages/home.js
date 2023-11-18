import { TemplateController } from 'meteor/space:template-controller';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { showError } from 'meteor/imajus:bootstrap-helpers';
import { Accounts } from '/api/ethers';
import './home.html';

TemplateController('Home', {
  events: {
    async 'click [data-action=connectWallet]'() {
      try {
        await Accounts.connect();
        FlowRouter.go('Register');
      } catch (err) {
        showError(err);
      }
    },
  },
});
