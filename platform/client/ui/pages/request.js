import { TemplateController } from 'meteor/space:template-controller';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './request.html';

TemplateController('Request', {
  helpers: {
    hash: () => FlowRouter.getParam('hash'),
  },
});
