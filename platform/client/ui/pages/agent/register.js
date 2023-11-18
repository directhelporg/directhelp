import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { TemplateController } from 'meteor/space:template-controller';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Accounts } from '/api/ethers';
import { callContractWriteFunction } from '/api/multibaas';
import './register.html';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

TemplateController('AgentRegister', {
  helpers: {
    schema: () => new SimpleSchema({
      name: String,
      location: String,
      households: {
        type: SimpleSchema.Integer,
        min: 1,
        max: 1000,
      },
    }),
  },
});

AutoForm.addHooks('registerAgent', {
  onSubmit({ name, location, households }) {
    this.event.preventDefault();
    callContractWriteFunction(DirectHelp, 'agentRegister', [name, location, households], {
      from: Accounts.current.get(),
    })
      .then(res => this.done(null, res))
      .catch(this.done);
    return false;
  },
  onSuccess(formType, hash) {
    FlowRouter.go('Registration', { hash });
  },
});
