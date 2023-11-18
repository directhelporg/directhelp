import 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import popper from 'popper.js';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { AutoForm } from 'meteor/aldeed:autoform';
import { BootstrapHelpers, showToast } from 'meteor/imajus:bootstrap-helpers';
import { AutoFormThemeBootstrap4 } from 'meteor/communitypackages:autoform-bootstrap4/static';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import 'meteor/aldeed:autoform/static';
import '/init';
import './api';
import './routes';
import './ui/helpers';

global.Popper = popper; // fixes some issues with Popper and Meteor

BootstrapHelpers.forBootstrap4 = true;

AutoFormThemeBootstrap4.load();
AutoForm.setDefaultTemplate('bootstrap4');
AutoForm.addHooks(null, {
  onError(formType, err) {
    this.event.preventDefault();
    showToast({
      heading: 'Submission error',
      message: err.message,
      brand: 'danger',
    });
  },
});

if (Meteor.isDevelopment) {
  AutoForm.debug();
}

Accounts.onLogin(() => {
  FlowRouter.go('ManagerDashboard');
});

Accounts.onLogout(() => {
  FlowRouter.go('/');
});

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});
