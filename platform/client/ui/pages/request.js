import { Meteor } from 'meteor/meteor';
import { TemplateController } from 'meteor/space:template-controller';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { showToast } from 'meteor/imajus:bootstrap-helpers';
import './request.html';

TemplateController('Request', {
  state: {
    loading: true,
  },
  onRendered() {
    const assertionId = FlowRouter.getParam('assertionId');
    Meteor.setTimeout(async () => {
      try {
        await Meteor.callAsync('settleRequest', assertionId);
      } catch (err) {
        showToast({
          message: err.message,
          brand: 'danger',
        });
      } finally {
        this.state.loading = false;
      }
    }, 5000);
  },
  helpers: {
    assertionId: () => FlowRouter.getParam('assertionId'),
  },
});
