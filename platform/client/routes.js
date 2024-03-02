import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Web3Accounts } from 'meteor/majus:web3';
import './ui/layout';
import './ui/pages/home';
import './ui/pages/registration';
import './ui/pages/request';
import './ui/pages/agent/register';
import './ui/pages/agent/submit';
import './ui/pages/manager/dashboard';

// Preload already connected Web3 accounts
FlowRouter.wait();
Meteor.startup(async () => {
  //FIXME: Force page reload in case if MetaMask hangs forever
  const timeout = Meteor.setTimeout(() => window.location.reload(), 2000);
  await Web3Accounts.init();
  FlowRouter.initialize();
  Meteor.clearTimeout(timeout);
});

const manager = FlowRouter.group({
  name: 'manager',
  prefix: '/manager',
});

const agent = FlowRouter.group({
  name: 'agent',
  prefix: '/agent',
  triggersEnter: [
    (context, redirect) => {
      if (!Web3Accounts.isConnected) {
        redirect('/');
      }
    },
  ],
});

FlowRouter.route('/', {
  name: 'Home',
  action() {
    this.render('Layout', { main: 'Home' });
  },
});

FlowRouter.route('/registration/:hash', {
  name: 'Registration',
  action() {
    this.render('Layout', { main: 'Registration' });
  },
});

FlowRouter.route('/request/:assertionId', {
  name: 'Request',
  action() {
    this.render('Layout', { main: 'Request' });
  },
});

agent.route('/register', {
  name: 'Register',
  action() {
    this.render('Layout', { main: 'AgentRegister' });
  },
});

agent.route('/submit', {
  name: 'AgentSubmit',
  action() {
    this.render('Layout', { main: 'AgentSubmit' });
  },
});

manager.route('/', {
  name: 'ManagerDashboard',
  action() {
    this.render('Layout', { main: 'ManagerDashboard' });
  },
});
