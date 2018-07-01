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
const MongoDB_1 = require("../DB/MongoDB");
const crypto_1 = require("./crypto");
const passport_1 = require("./passport");
const reset = require("./reset/reset");
exports.router = express.Router();
exports.router.use('/reset', reset.router);
let userProperties = [
    'address', 'username', 'firstName', 'lastName', 'email', 'gender', 'className'
];
exports.router.post('/login', passport_1.passport.authenticate('local', { failureMessage: 'wrong username or password' }), function (req, res) {
    if (req.user) {
        res.status(201).end("login successful");
        return;
    }
    res.status(400).end('Wrong username or password');
});
exports.router.post('/logout', function (req, res) {
    req.logout();
    res.end("You've logged successfully");
});
// requests the salts for the challengs
exports.router.post('/salts', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let username = req.body.username;
        passport_1.tempSalts[username] = crypto_1.getRandomString(crypto_1.hashLength);
        res.json({
            tempSalt: passport_1.tempSalts[username],
            permSalt: (yield MongoDB_1.db.getUserAuthData(username)).salt
        });
    });
});
//------------------------------------------------------------
function createUserData(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let salt = crypto_1.getRandomString();
        let hash = crypto_1.sha512(password, salt);
        let userAuthData = { salt, username, hashedPassword: hash };
        yield MongoDB_1.db.createUserAuthData(userAuthData);
    });
}
exports.createUserData = createUserData;
//# sourceMappingURL=auth.js.map