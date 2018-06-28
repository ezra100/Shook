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
const path = require("path");
const types_1 = require("../types");
const MongoDB_1 = require("./MongoDB");
const logFile = path.join(__dirname, 'password.log');
function generateUser() {
    let firstName = faker.name.firstName();
    let lastName = faker.name.lastName();
    let username = faker.internet.userName(firstName, lastName);
    let password = faker.internet.password();
    let user = {
        userType: faker.random.number(20) > 19 ? types_1.UserType.Admin : types_1.UserType.Basic,
        firstName,
        lastName,
        username,
        address: faker.address.streetAddress() + ', ' + faker.address.city() +
            ', ' + faker.address.country(),
        email: faker.internet.email(),
        gender: faker.random.boolean ? types_1.Gender.Male : types_1.Gender.Female,
        imageURL: '/img/default.png'
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
function getFakeProduct(users) {
    return {
        title: faker.lorem.sentence(),
        subtitle: faker.lorem.paragraph(),
        link: faker.internet.url(),
        username: users[faker.random.number(users.length - 1)].username
    };
}
function initProducts(size = 1500) {
    return __awaiter(this, void 0, void 0, function* () {
        let users = yield MongoDB_1.db.getUsers();
        for (let i = 0; i < size; i++) {
            MongoDB_1.db.addProduct(getFakeProduct(users));
        }
    });
}
function initDB(size = 50, logPasswod = true) {
    return __awaiter(this, void 0, void 0, function* () {
        // for (let pack of getFakeUsers(size)) {
        //   db.addUser(pack.user);
        //   createUserData(pack.user.username, pack.password);
        //   // log
        //   if (logPasswod) {
        //     let logText = pack.user.username + ' : ' + pack.password + '\n';
        //     fs.appendFile(logFile, logText, function(err) {
        //       if (err) {
        //         console.error(err);
        //       }
        //     });
        //   }
        // }
        initProducts();
    });
}
exports.initDB = initDB;
//# sourceMappingURL=data-generator.js.map