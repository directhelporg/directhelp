import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './ui/layout';
import './ui/pages/home';
import './ui/pages/manager/dashboard';

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
  action() {
    this.render('Layout', { main: 'Home' });
  },
});

manager.route('/', {
  name: 'ManagerDashboard',
  action() {
    this.render('Layout', { main: 'ManagerDashboard' });
  },
});
