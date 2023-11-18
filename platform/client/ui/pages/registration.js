import { Meteor } from 'meteor/meteor';
import { TemplateController } from 'meteor/space:template-controller';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './registration.html';

TemplateController('Registration', {
  helpers: {
    hash: () => FlowRouter.getParam('hash'),
  },
});
