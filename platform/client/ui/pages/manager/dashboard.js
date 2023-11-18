import { Meteor } from 'meteor/meteor';
import { TemplateController } from 'meteor/space:template-controller';
import { Blaze } from 'meteor/blaze';
import { showToast } from 'meteor/imajus:bootstrap-helpers';
import { Events } from '/api/multibaas';
import './dashboard.html';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

TemplateController('ManagerDashboard', {
  state: {
    agents: null,
    requests: null,
    working: false,
  },
  async onRendered() {
    try {
      await this.fetchAgents();
      await this.fetchRequests();
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
    capacity: () => '10000 USDC',
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
  },
  private: {
    async fetchAgents() {
      this.state.agents = [
        {
          agentAddress: '0x490B7A3CE287dfE8E21eb9eA01a2C8B02D62EE8a',
          name: 'Denis, the Baker',
          location: 'Turkey, Istanbul',
        },
        {
          agentAddress: '0xCa5a940E87cC4D4cC9F5F749c58a4DDcA79a3328',
          name: 'Denis, the Driver',
          location: 'Turkey, Bursa',
        },
      ];
      // const { data } = await Events.listEvents(
      //   undefined, //blockHash
      //   undefined, //blockNumber
      //   undefined, //txIndexInBlock
      //   undefined, //eventIndexInLog
      //   undefined, //txHash
      //   undefined, //fromConstructor
      //   'ethereum',
      //   DirectHelp.address,
      //   DirectHelp.label,
      //   undefined, //'agentRegister(string,string)', //eventSignature
      //   undefined, //limit
      //   undefined, //offset
      // );
      // return data.result;
    },
    async fetchRequests() {
      this.state.requests = [
        {
          agentAddress: '0xCa5a940E87cC4D4cC9F5F749c58a4DDcA79a3328',
          assertionId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        },
      ];
      // const { data } = await Events.listEvents(
      //   undefined, //blockHash
      //   undefined, //blockNumber
      //   undefined, //txIndexInBlock
      //   undefined, //eventIndexInLog
      //   undefined, //txHash
      //   undefined, //fromConstructor
      //   'ethereum',
      //   DirectHelp.address,
      //   DirectHelp.label,
      //   '???', //eventSignature
      //   undefined, //limit
      //   undefined, //offset
      // );
      // return data.result;
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
