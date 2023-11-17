import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.startup(async () => {
  if (await Meteor.users.estimatedDocumentCount() === 0) {
    Accounts.createUser({
      username: 'admin',
      email: 'admin@localhost',
      password: 'Passw0rd',
      profile: { name: 'Admin' },
    });
  }
});
