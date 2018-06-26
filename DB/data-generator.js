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
const faker = require("faker");
const fs = require("fs");
const path = require("path");
const types_1 = require("../types");
const MongodDB_1 = require("./MongodDB");
const auth_1 = require("../auth/auth");
const logFile = path.join(__dirname, 'password.log');
function generateUser() {
    let firstName = faker.name.firstName();
    let lastName = faker.name.lastName();
    let username = faker.internet.userName(firstName, lastName);
    let password = faker.internet.password();
    let user = {
        firstName,
        lastName,
        username,
        address: faker.address.streetAddress() + ', ' + faker.address.city() +
            ', ' + faker.address.country(),
        email: faker.internet.email(),
        gender: faker.random.boolean ? types_1.Gender.Male : types_1.Gender.Female
    };
    return { user, password: password };
}
function getFakeUsers(num) {
    let arr = [];
    for (let i = 0; i < num; i++) {
        arr.push(generateUser());
    }
    return arr;
}
function initDB(usersSize = 50, logPasswod = true) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let pack of getFakeUsers(usersSize)) {
            MongodDB_1.db.addUser(pack.user);
            auth_1.createUserData(pack.user.username, pack.password);
            //log
            if (logPasswod) {
                let logText = pack.user.username + ' : ' + pack.password + '\n';
                fs.appendFile(logFile, logText, function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        }
    });
}
exports.initDB = initDB;
//# sourceMappingURL=data-generator.js.map