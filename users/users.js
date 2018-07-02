"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const auth_1 = require("../auth/auth");
const MongoDB_1 = require("../DB/MongoDB");
exports.router = express.Router();
let userProperties = [
    'address', 'username', 'firstName', 'lastName', 'email', 'gender', 'className'
];
// create a new user
exports.router.post('/signup', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = {};
        for (let key of userProperties) {
            user[key] = req.body[key];
        }
        user = yield MongoDB_1.db.addUser(user).catch(function (reason) {
            res.status(500).end('Failed to add user, reason: ' + JSON.stringify(reason));
        });
        if (!user) {
            return;
        }
        let password = req.body.password;
        auth_1.createUserData(user.username, password);
        res.status(201).end();
    });
});
// update details about the current user
exports.router.put('/updateDetails', function (req, res) {
    let user = {};
    for (let key of userProperties) {
        if (req.body[key]) {
            user[key] = req.body[key];
        }
    }
    let username = req.user.username;
    let response = MongoDB_1.db.updateUserById(username, user);
    res.status(201).end('Your details were updated successfully');
});
// returns the details about the current logged in user
exports.router.get('/getDetails', function (req, res) {
    if (req.user) {
        res.json(req.user);
        return;
    }
    res.status(404).end('You\'re not logged in');
});
exports.router.put("/follow", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let followee = req.query.followee;
        let follower = req.user.username;
        let dbRes = yield MongoDB_1.db.addFollowee(follower, followee);
        res.json(dbRes);
    });
});
exports.router.put("/unfollow", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let followee = req.query.followee;
        let follower = req.user.username;
        let dbRes = yield MongoDB_1.db.removeFollowee(follower, followee);
        res.json(dbRes);
    });
});
//# sourceMappingURL=users.js.map