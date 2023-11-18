import { TemplateController } from 'meteor/space:template-controller';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './request.html';

TemplateController('Request', {
  helpers: {
    assertionId: () => FlowRouter.getParam('assertionId'),
  },
});
