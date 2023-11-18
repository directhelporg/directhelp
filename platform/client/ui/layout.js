import { TemplateController } from 'meteor/space:template-controller';
import { Blaze } from 'meteor/blaze';
import { Accounts } from '/api/ethers';
import './layout.html';

TemplateController('Layout', {
  events: {
    'click [data-action=selectAccount]'(e) {
      e.preventDefault();
      const account = Blaze.getData(e.currentTarget);
      Accounts.current.set(account);
    },
  },
});
