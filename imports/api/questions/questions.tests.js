import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { Question } from './questions.js';
import { PolarStats } from './questions.js';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Defaults } from '/imports/startup/both/defaults.js';
import { User } from '../users/users.js';
import { Answer } from "../users/users.js";
import { UserType } from "../users/users.js";
import { Profile } from "../users/users.js";
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


// Meteor.loginWithPassword('admin@mydomain.com', 'admin');

let testData;
let defaultUser;

if (Meteor.isServer) {
    describe('Questions', function () {
        this.timeout(15000);

        beforeEach(function() {
            resetDatabase();

            defaultUser = Accounts.createUser({
                username: Defaults.user.username,
                email: Defaults.user.email,
                password: 'admin',
                isAdmin: Defaults.user.isAdmin,
                profile: Defaults.user.profile,
                teams: ['testTeam']
                // , _id: 'TestId'
            });
            // defaultUser.save();

            testData = {
                testQuestion: {
                    Text: 'Text Unit Test',
                    LeftText: 'Unit Test LeftText',
                    RightText: 'Unit Test RightText',
                    CreatedBy: 'TestId', //defaultUser._id.str,
                    Category: 0
                }
            };

            sinon.stub(Meteor, 'userId').returns(defaultUser._id);
        });

        afterEach(function () {
            Meteor.userId.restore();
            resetDatabase();
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

            // let q = new Question( testData.testQuestion );
            // q.save();
            // testQuestion = Question.findOne( {_id:q._id} );
            // chai.assert( testQuestion, true );
        });

        // Test of Question methods and helpers
        it('getUser returns the user that created the question', function() {
            let u = User.findOne( {username: Defaults.user.username} );
            let q = new Question( testData.testQuestion );
            q.CreatedBy = u._id;
            q.save();
            let qTest = q.getUser();
            chai.assert.equal( qTest._id, u._id );

        });
        it('Negative addAnswer results in addition to TimesAnswered.LeftSum', function() {
            let q = new Question( testData.testQuestion );
            q.save();
            let lsStart = q.TimesAnswered.LeftSum;
            let ans = {Value: -1};
            q.addAnswer(ans);
            let lsFinal = q.TimesAnswered.LeftSum;
            // console.log("lsStart", lsStart);
            // console.log("lsFinal", lsFinal);
            chai.assert(lsFinal == lsStart + 1);

        });
        it('Positve removeAnswer results in negation of TimesAnswered.RightSum', function() {
            let q = new Question( testData.testQuestion );
            let rsStart = q.TimesAnswered.RightSum;
            let ans = {Value: 1};
            q.addAnswer(ans);
            let rsAdd = q.TimesAnswered.RightSum;
            // console.log("rsStart", rsStart);
            // console.log("rsAdd", rsAdd);
            chai.assert(rsAdd == rsStart + 1);
            q.removeAnswer(ans);
            let rsRemove = q.TimesAnswered.RightSum;
            // console.log("rsAdd", rsAdd);
            // console.log("rsRemove", rsRemove);
            chai.assert(rsRemove == rsAdd - 1);

        });
        it('todo allAnsweredUsers returns at least one user that answered the question', function() {
            let uid = User.findOne( {username: Defaults.user.username} )._id;
            let q = new Question( testData.testQuestion );
            q.CreatedBy = uid;
            q.save();
            // create 'MyProfile.UserType.AnsweredQuestions.QuestionID for u
            let a = new Answer( {QuestionID: q._id} );
            // a.save();
            let ut = new UserType( {AnsweredQuestions: [a]} );
            // ut.save();
            let p = new Profile({UserType: ut,
                firstName: 'Admin',
                lastName: 'Admin',
                gender: 'female'});
            Meteor.users.update({_id: uid}, {$set: {MyProfile: p}});
            Meteor.users.update({_id: uid}, {$set: {'MyProfile.UserType': ut}});
            Meteor.users.update({_id: uid}, {$set: {'MyProfile.UserType.AnsweredQuestions': [a]}});
            Meteor.users.update({_id: uid}, {$set: {'MyProfile.UserType.AnsweredQuestions[0].QuestionID': q._id}});
            console.log("User.findOne(uid).MyProfile.UserType.AnsweredQuestions[0].QuestionID: ", User.findOne(uid).MyProfile.UserType.AnsweredQuestions[0].QuestionID);
            console.log("User.findOne(uid).MyProfile.UserType.AnsweredQuestions: ", User.findOne(uid).MyProfile.UserType.AnsweredQuestions);
            Meteor.users.update({_id: uid}, {$set: {'MyProfile.firstName': 'Pringle'}});
            console.log("User.findOne(uid).MyProfile.firstName", User.findOne(uid).MyProfile.firstName);
            Meteor.users.update({_id: uid}, {$set: {'MyProfile.UserType.AnsweredQuestion[0].QuestionID': q._id}});
            console.log("User.findOne(uid).MyProfile.UserType.UserType.AnsweredQuestions[0]", User.findOne(uid).MyProfile.UserType.AnsweredQuestions[0]);
            let uTest = q.allAnsweredUsers();
            // console.log("uTest[0]._id", uTest[0]._id);
            console.log("q._id: ", q._id);
            console.log("uTest.fetch(): ", uTest.fetch());
            let qid = q._id;
            let uTemp1 =  User.find({ 'MyProfile.UserType.AnsweredQuestions[0].QuestionID': qid });
            let uTemp2 =  User.find({ 'MyProfile.firstName':{ $eq: 'Pringle' } });
            let uTemp3 =  User.find({ 'MyProfile.UserType.AnsweredQuestions': { $elemMatch: { 'QuestionID': qid } } });
            // let uTemp3 =  User.find({ });
            // let uTemp3 =  User.find({ pid: {$elemMatch: {$in: user.MyProfile.UserType.AnsweredQuestions.QuestionID} } });
            // let uTemp3 = User.find({ 'MyProfile.UserType.AnsweredQuestions.QuestionID':{ $eq: qid } });
            // let uTemp3 =  User.find({ 'MyProfile.UserType.AnsweredQuestions': { $elemMatch: { 'QuestionID': qid } } });
            // let uTemp3 =  User.find({ MyProfile: { $elemMatch: { UserType: { $elemMatch: { AnsweredQuestions: { $elemMatch: { QuestionID: qid } } } } } } });

            console.log("uTemp1.fetch(): ", uTemp1.fetch());
            console.log("uTemp2.fetch(): ", uTemp2.fetch());
            console.log("uTemp3.fetch(): ", uTemp3.fetch());
            console.log("User.findOne(uid).MyProfile.first_name", User.findOne(uid).MyProfile.firstName);
            console.log("User.findOne(uid): ", User.findOne(uid));
            // console.log("uTest.MyProfile.UserType.AnsweredQuestions[0].QuestionID", uTest.MyProfile.UserType.AnsweredQuestions[0].QuestionID);
            // console.log("a: ", a);
            // console.log("ut: ", ut);
            // console.log("p: ", p);
            // console.log("User.findOne(uid).MyProfile: ", User.findOne(uid).MyProfile);
            // console.log("qTest.fetch(): ", qTest.fetch());
            // console.log("qTest.count(): ", qTest.count());
            // console.log("qTest: ", qTest);
            // console.log(qTest)kk









            // // let u = User.findOne( {username: Defaults.user.username} );
            // // let q = new Question( testData.testQuestion );
            // // q.CreatedBy = u._id;
            // // q.save();
            //
            // // create 'MyProfile.UserType.AnsweredQuestions.QuestionID for u
            // let q = new Question( testData.testQuestion );
            // let a = new Answer( {QuestionID: q._id} );
            // // a.save();
            // let ut = new UserType( {AnsweredQuestions: [a]} );
            // // ut.save();
            // let p = new Profile({UserType: ut,
            //     first_name: 'Admin',
            //     last_name: 'Admin',
            //     gender: 'female'});
            // p.birthDate = new Date(2000, 0, 1);
            // console.log("p.birthDate: ", p.birthDate);
            //
            // let usr = new Accounts.createUser({
            //     username: 'user1',
            //     email: 'email1',
            //     password: 'password',
            //     isAdmin: Defaults.user.isAdmin,
            //     MyProfile: p,
            //     teams: ['testTeam']
            //     // , _id: 'TestId'
            // });
            //
            // q.CreatedBy = usr._id;
            // // q.save();
            //
            // // u.MyProfile = p;
            // // u.save();
            // let qTest = q.allAnsweredUsers();
            // console.log("usr.MyProfile.UserType.AnsweredQuestions[0].QuestionID: ", usr.MyProfile.UserType.AnsweredQuestions[0].QuestionID);
            // console.log("q._id: ", q._id);
            // console.log("a: ", a);
            // console.log("ut: ", ut);
            // console.log("p: ", p);
            // console.log("usr.MyProfile: ", usr.MyProfile);
            // console.log("qTest: ", qTest);
            // console.log("qTest.count() ", qTest.count());

            // // create question and attach it to the default user
            // let u = User.findOne( {username: Defaults.user.username} );
            // let q = new Question( testData.testQuestion );
            // q.CreatedBy = u._id;
            // q.save();
            // // let ansU = q.allAnsweredUsers();
            //
            // // add an Answer
            // let lsStart = q.TimesAnswered.LeftSum;
            // let ans = {Value: -1};
            // q.addAnswer(ans);
            // let lsFinal = q.TimesAnswered.LeftSum;
            // // console.log("lsStart", lsStart);
            // // console.log("lsFinal", lsFinal);
            // chai.assert(lsFinal == lsStart + 1);
            //
            // console.log("ansU: ", ansU);




            // let q = new Question( testData.testQuestion );
            // let u = q.allAnsweredUsers();
        });
        it('todo unanswerAll unanswers the question for all users', function() {
            // Once the allAnsweredUsers test is working, you should be able to create this code based off of that code.
        });
        it('reset() resets TimesAnswered and SumOfAnswers', function() {
            let q = new Question( testData.testQuestion );
            let taStart = ++q.TimesAnswered.LeftSum;
            let soaStart = ++q.SumOfAnswers.LeftSum;
            // console.log("taStart: ", taStart);
            // console.log("soaStart: ", soaStart);
            q.reset();
            let taFinish = q.TimesAnswered.LeftSum;
            let soaFinish = q.SumOfAnswers.LeftSum;
            // console.log("taFinish: ", taFinish);
            // console.log("soaFinish: ", soaFinish);
            chai.assert((taFinish == 0) && (soaFinish == 0));
        });


    });
}
