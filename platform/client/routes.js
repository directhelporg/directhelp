import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Accounts } from '/api/ethers';
import './ui/layout';
import './ui/pages/home';
import './ui/pages/register';
import './ui/pages/manager/dashboard';

// Preload already connected Web3 accounts
(async () => {
  FlowRouter.wait();
  await Accounts.init();
  FlowRouter.initialize();
})();

const manager = FlowRouter.group({
  name: 'manager',
  prefix: '/manager',
  triggersEnter: [(context, redirect) => {
    if (!Meteor.userId()) {
      redirect('/');
    }
  }],
});

FlowRouter.route('/', {
  name: 'Home',
  action() {
    this.render('Layout', { main: 'Home' });
  },
});

FlowRouter.route('/register', {
  name: 'Register',
  triggersEnter: [(context, redirect) => {
    if (!Accounts.isConnected()) {
      redirect('/');
    }
  }],
  action() {
    this.render('Layout', { main: 'Register' });
  },
});

FlowRouter.route('/registration/:hash', {
  name: 'Registration',
  action() {
    this.render('Layout', { main: 'Registration' });
  },
});

manager.route('/', {
  name: 'ManagerDashboard',
  action() {
    this.render('Layout', { main: 'ManagerDashboard' });
  },
});
