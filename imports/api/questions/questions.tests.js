import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { Question } from './questions.js';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Defaults } from '/imports/startup/both/defaults.js';
import { User } from '../users/users.js';
import { UserNotify } from '/imports/api/user_notify/user_notify.js';

// // create a default user (admin)
// if (!Meteor.users.findOne( {username: Defaults.user.username} )) {
//     defaultUser = Accounts.createUser({
//         username: Defaults.user.username,
//         email: Defaults.user.email,
//         password: 'admin',
//         isAdmin: Defaults.user.isAdmin,
//         profile: Defaults.user.profile,
//         teams: ['testTeam']
//     });
// }


// Meteor.loginWit`hPassword('admin@mydomain.com', 'admin');

let testData;
let defaultUser;

if (Meteor.isServer) {
    describe('Questions', function () {
        this.timeout(15000);
        beforeEach(function () {
            resetDatabase();

            defaultUser = Accounts.createUser({
                username: Defaults.user.username,
                email: Defaults.user.email,
                password: 'admin',
                isAdmin: Defaults.user.isAdmin,
                profile: Defaults.user.profile,
                teams: ['testTeam']
                // , _id: 'testId'
            });
            // defaultUser.save();

            testData = {
                testQuestion: {
                    Text: 'Text Unit Test',
                    LeftText: 'Unit Test LeftText',
                    RightText: 'Unit Test RightText',
                    CreatedBy: 'testId',
                    Category: 0
                }
            };

            sinon.stub(Meteor, 'userId').returns(defaultUser._id);
        });
        afterEach(function () {
            Meteor.userId.restore();
        });
        it('totalQuestions is greater than or equal to 0', function () {
            let totalQuestions = Question.find().count();
            chai.assert(totalQuestions >= 0, 'totalQuestions is negative');
        });

        it('can create a question', function () {
            let q = new Question( testData.testQuestion );
            q.save();
            let qTest = Question.findOne( {_id:q._id} );
            chai.assert( qTest, true );
        });

        // Test of Question methods and helpers
        it('todo getUser returns the user that created the question', function() {
            // let q = new Question( testData.testQuestion );
            // q.save();
            // let qTest = q.getUser();
            // chai.assert( qTest, true );

            // let q = new Question( testData.testQuestion );
            // q.save();
            // let qTest = q.getUser();
            // chai.assert.equal( qTest, defaultUser );
        });
        it('todo Negative addAnsewer results in addition to LeftSum', function() {});
        it('todo Positve removeAnswer results in negation of RightSum', function() {});
        it('todo allAnsweredUsers returns questions answered by the user', function() {});
        it('todo unanswerAll unanswers the question for all users', function() {});
        it('todo reset() resets TimesAnswered and SumOfAnswers', function() {});


    });
}
