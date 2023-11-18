import { Meteor } from 'meteor/meteor';
import { TemplateController } from 'meteor/space:template-controller';
import { Blaze } from 'meteor/blaze';
import { showToast } from 'meteor/imajus:bootstrap-helpers';
import { callContractReadFunction, fetchEvents } from '/api/multibaas';
import './dashboard.html';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

TemplateController('ManagerDashboard', {
  state: {
    agents: null,
    requests: null,
    balance: null,
    working: false,
  },
  async onRendered() {
    try {
      await this.fetchAgents();
      await this.fetchRequests();
      await this.fetchBalance();
    } catch (err) {
      if (err.response?.data) {
        const { status, message } = err.response.data;
        showToast({
          message: `Error: ${message} [${status}]`,
          brand: 'danger',
        });
      } else if (err.code) {
        showToast({
          message: `Error: ${err.message} [${err.code}]`,
          brand: 'danger',
        });
      }
      showToast({
        message: err.message,
        brand: 'danger',
      });
    }
  },
  helpers: {
    balance() {
      const { balance } = this.state;
      return `${balance} ${DirectHelp.symbol}`;
    },
  },
  events: {
    async 'click [data-action=approveAgent]'(e) {
      const { name, agentAddress } = Blaze.getData(e.currentTarget);
      this.state.agents = null;
      try {
        await this.callContractMethod('approveAgent', agentAddress);
        showToast({
          message: `Agent "${name}" has been approved`,
          brand: 'success',
        });
      } finally {
        await this.fetchAgents();
      }
    },
    async 'click [data-action=rejectAgent]'(e) {
      const { agentAddress } = Blaze.getData(e.currentTarget);
      this.state.agents = null;
      try {
        await this.callContractMethod('rejectAgent', agentAddress);
        showToast({
          message: 'Agent registration has been rejected',
          brand: 'info',
        });
      } finally {
        await this.fetchAgents();
      }
    },
    async 'click [data-action=challengeRequest]'(e) {
      const { assertionId } = Blaze.getData(e.currentTarget);
      this.state.requests = null;
      try {
        await this.callContractMethod('challengeRequest', assertionId);
        showToast({
          message: 'Funding request has been challenged',
          brand: 'info',
        });
      } finally {
        await this.fetchRequests();
      }
    },
  },
  private: {
    async fetchAgents() {
      const all = await fetchEvents(DirectHelp, 'AgentRegistered(address,string,string,uint64)');
      const approved = await fetchEvents(DirectHelp, 'AgentApproved(address)');
      const rejected = await fetchEvents(DirectHelp, 'AgentSuspended(address)');
      this.state.agents = all.map(({ event, triggeredAt }) => {
        const address = event.inputs[0].value;
        return {
          agentAddress: address,
          name: event.inputs[1].value,
          location: event.inputs[2].value,
          timestamp: new Date(triggeredAt),
          approved: approved.some(({ event }) => event.inputs[0].value === address),
          rejected: rejected.some(({ event }) => event.inputs[0].value === address),
        };
      });
    },
    async fetchRequests() {
      const requests = await fetchEvents(DirectHelp, 'RequestInitiated(address,bytes32)');
      this.state.requests = requests.map(({ event, triggeredAt }) => ({
        agentAddress: event.inputs[0].value,
        assertionId: event.inputs[1].value,
        timestamp: new Date(triggeredAt),
      }));
    },
    async fetchBalance() {
      const balance = await callContractReadFunction(DirectHelp, 'getCurrencyBalance');
      this.state.balance = balance / 1e18;
    },
    async callContractMethod(name, ...args) {
      try {
        return await Meteor.callAsync(name, ...args);
      } catch (err) {
        showToast({
          message: err.message,
          heading: `Server error: ${err.code}`,
          brand: 'danger',
        });
        throw err;
      }
    },
  },
});
