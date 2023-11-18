import SimpleSchema from 'simpl-schema';
import { TemplateController } from 'meteor/space:template-controller';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Accounts } from '/api/ethers';
import './register.html';

TemplateController('Register', {
  helpers: {
    schema: () => new SimpleSchema({
      wallet: {
        type: String,
        allowedValues: () => Accounts.connected.get(),
        autoform: {
          type: 'select',
          value: Accounts.current,
        },
      },
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
  onSubmit({ wallet, name, location, households }) {
    this.event.preventDefault();
    return false;
  },
  onSuccess(formType, res) {},
});
