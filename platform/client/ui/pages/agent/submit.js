import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { TemplateController } from 'meteor/space:template-controller';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { AutoForm } from 'meteor/aldeed:autoform';
import { showToast } from 'meteor/imajus:bootstrap-helpers';
import { Accounts } from '/api/ethers';
import { callContractReadFunction } from '/api/multibaas';
import './submit.html';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

TemplateController('AgentSubmit', {
  helpers: {
    schema: () => new SimpleSchema({
      description: String,
      households: {
        type: SimpleSchema.Integer,
        min: 1,
        max: 1000,
      },
    }),
  },
});

AutoForm.addHooks('submitRequest', {
  onSubmit({ description, households }) {
    this.event.preventDefault();
    (async () => {
      try {
        await Meteor.callAsync('submitRequest', Accounts.current.get(), description, households);
        showToast({
          message: 'Funding request has been submitted',
          brand: 'success',
        });
        Meteor.setTimeout(async () => {
          // Fetch UMA assertion ID
          const assertionId = await callContractReadFunction(DirectHelp, 'recentAssertionId');
          this.done(null, assertionId);
        }, 5000);
      } catch (err) {
        this.done(err);
      }
    })();
    return false;
  },
  async onSuccess(formType, assertionId) {
    FlowRouter.go('Request', { assertionId });
  },
});
