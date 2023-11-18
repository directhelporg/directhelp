import { TemplateController } from 'meteor/space:template-controller';
import './dashboard.html';

TemplateController('ManagerDashboard', {
  helpers: {
    agents: () => [],
    capacity: () => '10000 USDC',
    requests: () => [],
  },
});
