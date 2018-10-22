import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { Team } from './teams.js';
import { Defaults } from '/imports/startup/both/defaults.js';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Profile } from "../users/users.js";
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Random } from 'meteor/random'
import { User } from '../users/users.js';
import { UserNotify } from '/imports/api/user_notify/user_notify.js';
import '../users/server/publications.js';
import '/imports/startup/both/at_config.js';

let defaultAdmin;
let defaultUser;
let defaultTeam;

if (Meteor.isServer) {


    describe('Team', function () {
        this.timeout(15000);
        let testUser;

        beforeEach(function() {
            resetDatabase();
            console.log("before each");

            defaultAdmin = new User({
                username: 'admin42',
                email: Defaults.user.email,
                password: 'admin',
                isAdmin: Defaults.user.isAdmin,
                profile: Defaults.user.profile
            });
            console.log("before each1");

            defaultUser = new User({
                username: 'user42',
                email: 'email1@mydomain.com',
                password: 'password',
                isAdmin: false,
                profile: {
              			first_name: 'Jill',
                    last_name: 'Parker',
              			gender: "female"
            		}
            });
            console.log("before each2");

            // defaultUser = new User({
            //     MyProfile: new Profile({
            //         firstName: 'Bob'
            //     })
            // });

            defaultTeam = new Team({
                Name: 'defaultTeam',
                CreatedBy: defaultAdmin._id
            });
            console.log("end of before each");

            // sinon.stub(Meteor, 'userId').returns(defaultUser._id);
        });

        afterEach(function () {
            // Meteor.userId.restore();
            // resetDatabase();
        });

        /*
        it('should publish 10 documents', function(done) {
            let pUserId = Accounts.createUser({
                username: "Flynn",
                email: "FlyingCockroach@mydomain.com",
                password: "password",
                profile: {
                    first_name: "Bob",
                    last_name: "Thompson",
                    gender: "male"
                }
            });
            let pUser = User.findOne({_id: pUserId});
            console.log("pUser 1", User.findOne({_id: pUserId}));
            // console.log("Users length: ", Meteor.users.find.count());
            // Meteor.users.update({_id: pUserId}, {$set: {"MyProfile.firstName": "Tim", createdAt: "2010-10-04T17:56:17.620Z"}}, (error) => {
            Meteor.users.update({_id: pUserId}, {$set: {createdAt: "2010-10-04T17:56:17.620Z"}}, (error) => {
                console.log("update is back: ", error);
                console.log("pUser 2", User.findOne({_id: pUserId}));
                console.log("Meteor.users.find().count()", Meteor.users.find().count());
                console.log("Meteor.users.findOne(pUserId)", Meteor.users.findOne(pUserId));
                // Meteor.call('user.addUser', (error, result) => {
                //     console.log("returned from user.addUser");
                // });
                done();
            });

            // const collector = new PublicationCollector({ userId: Random.id() });
            // // done();
            // console.log("entered the publish it");
            //
            // // testUser._id = Meteor.call('addUser', testUser);
            // // console.log("testUser._id", testUser._id);
            //
            // let guy = new User({
            //
            // });
            //
            // collector.collect('userData', (collections) => {
            //
            //
            //     console.log("entered collector.collect function. collections: ", collections);
            //     console.log("collections.users.length: ", collections.users.length);
            //     assert.equal(collections.users.length, 0);
            //     done();
            // });
        });
        */

        // userRequestJoin()
        it('user can ask to join a team', function () {
            console.log("entered ask to join");
            let uid = User.findOne({username: 'user1'})._id;
            sinon.stub(Meteor, 'userId').returns(uid);
            // console.log("u._id", uid);
            // console.log("Meteor.userId()", Meteor.userId());
            defaultTeam.userRequestJoin(); //This is what we are testing
            let userRole = Roles.getRolesForUser(uid, defaultTeam.Name)[0];
            // console.log("userRole: ", userRole);
            chai.assert(userRole == 'user-join-request');
            // console.log("Roles.getAllRoles().fetch(): ", Roles.getAllRoles().fetch());
            // console.log("Roles.getRolesForUser(uid, 'defaultTeam'): ", Roles.getRolesForUser(uid, 'defaultTeam'));
            // console.log("Roles.getUsersInRole('user-join-request', 'defaultTeam').fetch(): ", Roles.getUsersInRole('user-join-request', 'defaultTeam').fetch());
            Meteor.userId.restore();

        });
        // adminRequestUserJoin()
        it('admin can ask user to join a team', function () {
            let adminId = User.findOne({username: 'admin'})._id;
            let user1 = User.find({username: 'user1'}).fetch();
            let uid = user1[0]._id;
            // console.log("uid", uid);
            sinon.stub(Meteor, 'userId').returns(adminId);
            Roles.addUsersToRoles(Meteor.userId(), 'admin', defaultTeam.Name);
            Roles.addUsersToRoles(Meteor.userId(), 'member', defaultTeam.Name);
            defaultTeam.adminRequestUserJoin(user1);
            let unArray = UserNotify.find({}).fetch();
            // console.log("unArray: ", unArray);
            let returnId = -1;
            unArray.forEach(function(currentUser) {
                // console.log('currentUser: ', currentUser);
                if (currentUser._id = uid)
                {
                    returnId = currentUser._id;
                }
            });
            // console.log("returnId: %s, uid: %s", returnId, uid)
            chai.assert(returnId == uid);
            // console.log(returnId);
            Meteor.userId.restore();
        });
        //userAcceptJoin
        it('user can accept team invite', function () { // trying to find a way to stub this.addUsers
            // if Meteor.userId() is called, then userAcceptJoin

            let adminId = User.findOne({username: 'admin'})._id;
            let user1 = User.findOne({username: 'user1'});
            // console.log("user1: ", user1);
            sinon.stub(defaultTeam, 'addUser').returns("worked");
            // sinon.stub(users, 'length').returns("Hello nobody");
            Roles.addUsersToRoles(adminId, 'admin', defaultTeam.Name);
            Roles.addUsersToRoles(Meteor.userId(), 'user-join-request', defaultTeam.Name);
            Roles.addUsersToRoles(Meteor.userId(), 'admin-join-request', defaultTeam.Name);
            let uajOutput = defaultTeam.userAcceptJoin(); // This is the test
            console.log("uajOutput: ", uajOutput);
            console.log('defaultTeam.createdBy: ', defaultTeam.createdBy);
            // if member is part of the defaultTeam 'member' role, then they were added
            let rolesArray = Roles.getRolesForUser(user1._id, defaultTeam.Name);
            console.log("rolesArray: ", rolesArray);
            let partOfTeam = false;
            rolesArray.forEach(function(role) {
                console.log("role: ", role);
                if (role == 'member')
                {
                    partOfTeam = true;
                }
            });
            // chai.assert.isTrue(partOfTeam);
            Meteor.userId.restore();
            Team.prototype.addUser.restore();
        });

        it('user can decline team invite', function() {
            let user1 = User.findOne({username: 'user1'});

        });
        it('admin can accept user join request');
        it('admin can reject user join request');
        it('admin can add team role to team member');
        it('admin can remove team role from team member');
    });
}
