import { Meteor } from 'meteor/meteor';
import { TemplateController } from 'meteor/space:template-controller';
import { showToast } from 'meteor/imajus:bootstrap-helpers';
import { Events } from '/api/multibaas';
import './dashboard.html';

const { DirectHelp } = Meteor.settings.public.MultiBaas;

TemplateController('ManagerDashboard', {
  state: {
    agents: null,
    requests: null,
  },
  async onRendered() {
    try {
      // this.state.agents = await this.listAgents();
      // this.state.requests = await this.listRequests();
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
      this.state.requests = [
        {
          agentAddress: '0xCa5a940E87cC4D4cC9F5F749c58a4DDcA79a3328',
          assertionId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        },
      ];
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
    agents: () => [],
    capacity: () => '10000 USDC',
    requests: () => [],
  },
  private: {
    async listAgents() {
      const { data } = await Events.listEvents(
        undefined, //blockHash
        undefined, //blockNumber
        undefined, //txIndexInBlock
        undefined, //eventIndexInLog
        undefined, //txHash
        undefined, //fromConstructor
        'ethereum',
        DirectHelp.address,
        DirectHelp.label,
        undefined, //'agentRegister(string,string)', //eventSignature
        undefined, //limit
        undefined, //offset
      );
      return data.result;
    },
    async listRequests() {
      const { data } = await Events.listEvents(
        undefined, //blockHash
        undefined, //blockNumber
        undefined, //txIndexInBlock
        undefined, //eventIndexInLog
        undefined, //txHash
        undefined, //fromConstructor
        'ethereum',
        DirectHelp.address,
        DirectHelp.label,
        '???', //eventSignature
        undefined, //limit
        undefined, //offset
      );
      return data.result;
    },
  },
});
