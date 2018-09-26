import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { UserFeedback } from './user_feedback.js';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Defaults } from '/imports/startup/both/defaults.js';
// import { User } from '../users/users.js';
// import { UserNotify } from '/imports/api/user_notify/user_notify.js';


if (Meteor.isServer) {
    describe('Questions', function () {
        this.timeout(15000);
        
    });
}
