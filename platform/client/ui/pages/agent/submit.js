import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { TemplateController } from 'meteor/space:template-controller';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Accounts } from '/api/ethers';
import { callContractWriteFunction } from '/api/multibaas';
import './submit.html';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

TemplateController('AgentSubmit', {
  helpers: {
    schema: () => new SimpleSchema({
      description: String,
    }),
  },
});

AutoForm.addHooks('submitRequest', {
  async onSubmit({ description }) {
    this.event.preventDefault();
    callContractWriteFunction(DirectHelp, 'agentInitateFundRequest', [description, '99'], {
      from: Accounts.current,
    })
      .then(res => this.done(null, res))
      .catch(this.done);
    return false;
  },
  onSuccess(formType, hash) {
    FlowRouter.go('Request', { hash });
  },
});