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
const data_json_1 = require("../../data.json");
const MongoDB_1 = require("../../DB/MongoDB");
const helpers_1 = require("../../helpers");
const crypto_1 = require("../crypto");
exports.router = express.Router();
// request a password reset - sends an email to the given address if a user with
// such email exists
exports.router.post('/request', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let user;
        // the user can send an email or a username to reset
        if (req.body.email) {
            user = yield MongoDB_1.db.findUserByEmail(req.body.email);
        }
        else if (req.body.username) {
            user = yield MongoDB_1.db.getUser(req.body.username);
        }
        if (!user) {
            res.status(400).end('user not found');
            return;
        }
        let key = crypto_1.getRandomString(16);
        if (!user._id) {
            console.log(user);
            console.error(user._id + ' not found');
        }
        MongoDB_1.db.updateUserAuthData(user._id, { recoveryKey: key, recoveryCreationDate: new Date() });
        helpers_1.helpers.sendEmail(user.email, user.firstName + ' ' + user.lastName, 'Password reset for your account at flowers++', data_json_1.message.replace('placeholder', 'https://localhost:3000/complete?key=' + key +
            '&&username=' + user._id));
        // don't show the email unless the user sent it
        res.status(201).end('reset email sent to' + (req.body.email || 'your email'));
    });
});
// the target of the reset form - here the  password is replaced with the new
// one
exports.router.post('/complete', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let key = req.body.key;
        let username = req.body.username;
        let newPassword = req.body.password;
        let userData = yield MongoDB_1.db.getUserAuthData(username);
        if (newPassword && userData && userData.recoveryKey === key) {
            // if more than 24 hours past since the creation
            if ((new Date()).getTime() - userData.recoveryCreationDate.getTime() >=
                (1000 * 3600 * 24)) {
                res.status(400).end('Can\'t reset after more than 24 hours');
                return;
            }
            // deletes the key
            // todo - make sure that the key is actually deleted in MongoDB
            // new salt, because why not
            let newSalt = crypto_1.getRandomString(crypto_1.hashLength);
            let newPasswordHash = crypto_1.sha512(newPassword, newSalt);
            MongoDB_1.db.updateUserAuthData(username, {
                recoveryKey: undefined,
                hashedPassword: newPasswordHash,
                salt: newSalt
            });
            res.status(201).end("reset complete");
            return;
        }
        else {
            res.status(400).end('failed to reset password, key doesn\'t match or username not found');
        }
    });
});
//# sourceMappingURL=reset.js.map