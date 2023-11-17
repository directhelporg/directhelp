import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

SimpleSchema.debug = Meteor.isDevelopment;
SimpleSchema.extendOptions(['autoform']);
// For ostrio:autoform-files
// SimpleSchema.setDefaultMessages({
//   initialLanguage: 'en',
//   messages: {
//     en: {
//       uploadError: '{{value}}',
//     },
//   },
// });
