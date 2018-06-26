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
const passportMod = require("passport");
const passport_local_1 = require("passport-local");
const crypto_1 = require("./crypto");
const MongodDB_1 = require("../DB/MongodDB");
exports.tempSalts = {};
passportMod.use(new passport_local_1.Strategy(function (username, password, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        MongodDB_1.db.getUserAuthData(username).catch(cb).then((userAuthData) => {
            if (userAuthData) {
                let hashedPassword = crypto_1.sha512(userAuthData.hashedPassword, exports.tempSalts[username]);
                if (hashedPassword === password) {
                    return cb(null, userAuthData);
                }
            }
            return cb(null, false, { message: 'Wrong username or password' });
        });
    });
}));
passportMod.serializeUser(function (user, cb) {
    cb(null, user.username);
});
passportMod.deserializeUser(function (username, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        MongodDB_1.db.findUser(username).catch(cb).then((user) => cb(null, user));
    });
});
exports.passport = passportMod;
//# sourceMappingURL=passport.js.map