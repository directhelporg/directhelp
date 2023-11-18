import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { TemplateController } from 'meteor/space:template-controller';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Accounts } from '/api/ethers';
import { callContractWriteFunction } from '/api/multibaas';
import './challenge.html';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

TemplateController('ManagerChallenge', {
  helpers: {
    schema: () => new SimpleSchema({
      claim: {
        type: String,
        value: FlowRouter.getParam('hash'),
        autoform: {
          readonly: true,
        },
      },
      description: String,
    }),
  },
});

AutoForm.addHooks('challengeRequest', {
  async onSubmit({ description }) {
    this.event.preventDefault();
    const hash = FlowRouter.getParam('hash');
    callContractWriteFunction(DirectHelp, 'challengeFundRequest', [hash, description], {
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
