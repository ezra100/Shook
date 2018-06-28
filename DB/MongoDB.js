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
// import the mongoose module
const mongoose = require("mongoose");
const Models_1 = require("./Models");
let ObjectId = mongoose.Schema.Types.ObjectId;
// set up default mongoose connection
var connectionString = 'mongodb://127.0.0.1/shook';
mongoose.connect(connectionString);
// get the default connection
exports.mongoConnection = mongoose.connection;
// bind connection to error event (to get notification of connection errors)
exports.mongoConnection.on('error', console.error.bind(console, 'MongoDB connection error:'));
class MongoDB {
    getUserAuthData(username) {
        username = username.toLowerCase();
        return new Promise((resolve, reject) => {
            Models_1.userAuthDataModel.findById(username, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    }
    updateUserAuthData(username, data) {
        username = username.toLowerCase();
        return new Promise((resolve, reject) => {
            Models_1.userAuthDataModel.findByIdAndUpdate(username, data, { upsert: true }, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    createUserAuthData(data) {
        return new Promise((resolve, reject) => {
            Models_1.userAuthDataModel.create(data, (err, rData) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    findUserByEmail(email) {
        return new Promise((resolve, reject) => {
            Models_1.userModel.findOne({ email: email }, (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(user);
            });
        });
    }
    //#region users
    // todo: update this
    getUsers(filter = {}) {
        for (const key of Object.keys(filter)) {
            if (filter[key] === '') {
                delete filter[key];
                continue;
            }
            switch (getUserKeyType(key)) {
                case 'string':
                    // replace it with a regex that will search for any one of the given
                    // words
                    filter[key] = new RegExp(filter[key]
                        .split(/\s+/)
                        // escape regex characters
                        .map((v) => v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
                        .join('|'), 'gi');
                    break;
                case 'boolean':
                    if (typeof filter[key] === 'string') {
                        if (filter[key] === '') {
                            delete filter[key];
                        }
                        else {
                            filter[key] = (filter[key] === 'true');
                        }
                    }
                    break;
                case 'number':
                    // exception for 'gender' since it's an enum
                    if (typeof filter[key] === 'string' ||
                        filter[key] instanceof String) {
                        filter[key] = parseInt(filter[key], 10);
                    }
                    if (key === 'gender' && filter[key] === 0) {
                        delete filter[key];
                    }
            }
        }
        return new Promise((resolve, reject) => {
            Models_1.userModel.find(filter, (err, users) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(users);
            });
        });
    }
    getUser(username) {
        return new Promise((resolve, reject) => {
            Models_1.userModel.findById(username, (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(user);
            });
        });
    }
    updateUserById(username, user) {
        username = username.toLowerCase();
        return new Promise((resolve, reject) => {
            Models_1.userModel.findByIdAndUpdate(username, user, (err, oldUser) => {
                if (err) {
                    reject(err);
                    return;
                }
                // sending back the new one
                resolve(Object.assign([], oldUser, user));
            });
        });
    }
    addUser(user) {
        return new Promise((resolve, reject) => {
            let userDoc = new Models_1.userModel(user);
            userDoc.save((err, user) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(user);
            });
        });
    }
    deleteUser(user) {
        return new Promise((resolve, reject) => {
            Models_1.userModel.findByIdAndRemove(user.username.toLowerCase(), (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(user);
            });
        });
    }
    //#endregion
    addProduct(product) {
        return __awaiter(this, void 0, void 0, function* () {
            product._id = mongoose.Types.ObjectId();
            return (yield Models_1.productModel.create(product)).toObject();
        });
    }
    updateProduct(product) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.productModel.findByIdAndUpdate(new ObjectId(product._id), product))
                .toObject();
        });
    }
    getProductByID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // todo - check that the returned object returns a string for objectID's
            return (yield Models_1.productModel.findById(id)).toObject();
        });
    }
    getLatestProducts(username, offset = 0, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let filter = username ? { username } : username;
            let res = Models_1.productModel.find(filter).sort('-creationDate').skip(offset);
            if (limit) {
                res.limit(limit);
            }
            return (yield res.exec()).map(doc => doc.toObject());
        });
    }
}
function getUserKeyType(key) {
    return Models_1.userModel.schema.paths[key].instance.toLowerCase();
}
exports.db = new MongoDB();
//# sourceMappingURL=MongoDB.js.map