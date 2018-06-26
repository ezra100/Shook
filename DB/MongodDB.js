"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import the mongoose module
const mongoose = require("mongoose");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
// set up default mongoose connection
var connectionString = 'mongodb://127.0.0.1/shook';
mongoose.connect(connectionString);
// get the default connection
var mdb = mongoose.connection;
//#region schema
// define a schema
let Schema = mongoose.Schema;
let userSchema = new Schema({
    _id: String,
    userType: {
        type: Number,
        required: function () {
            return this.userType in types_1.UserType;
        }
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: {
        type: String,
        required: [
            function () {
                // username must be at least 6 letters, and english alphabet, underscore
                // and number only
                return /^[a-zA-Z0-9_]{6,}$/.test(this.username);
            },
            'username must be at least 6 characters. English alphabet, underscore and numbers only'
        ]
    },
    email: {
        type: String,
        index: { unique: true },
        required: function () {
            return helpers_1.helpers.validateEmail(this.email);
        }
    },
    gender: {
        type: Number,
        required: function () {
            return this.gender in types_1.Gender;
        }
    },
    address: { type: String, required: true },
    imageURL: { type: String, required: function () {
            return helpers_1.helpers.isValidURL(this.imageURL);
        } },
});
let userDataSchema = new Schema({
    _id: String,
    username: {
        type: String,
        required: [
            function () {
                // username must be at least 6 letters, and english alphabet, underscore
                // and number only
                return /^[a-zA-Z0-9_]{6,}$/.test(this.username);
            },
            'username must be at least 6 characters. English alphabet, underscore and numbers only'
        ]
    },
    recoveryKey: String,
    recoveryCreationDate: Date,
    salt: { type: String, required: true },
    hashedPassword: { type: String, required: true },
});
userDataSchema.pre('save', function (next) {
    this._id = this.username.toLowerCase();
    next();
});
userSchema.pre('save', function (next) {
    this._id = this.username.toLowerCase();
    next();
});
let userModel = mongoose.model('User', userSchema);
let userDataModel = mongoose.model('UserData', userDataSchema);
//#endregion
// bind connection to error event (to get notification of connection errors)
mdb.on('error', console.error.bind(console, 'MongoDB connection error:'));
class MongoDB {
    getUserAuthData(username) {
        username = username.toLowerCase();
        return new Promise((resolve, reject) => {
            userDataModel.findById(username, (err, data) => {
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
            userDataModel.findByIdAndUpdate(username, data, { upsert: true }, (err, data) => {
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
            userDataModel.create(data, (err, rData) => {
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
            userModel.findOne({ email: email }, (err, user) => {
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
            userModel.find(filter, (err, users) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(users);
            });
        });
    }
    findUser(username) {
        return new Promise((resolve, reject) => {
            userModel.findById(username, (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(user);
            });
        });
    }
    updateUserById(username, user) {
        // prevent changing the username
        delete user.username;
        username = username.toLowerCase();
        return new Promise((resolve, reject) => {
            userModel.findByIdAndUpdate(username, user, (err, oldUser) => {
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
            let userDoc = new userModel(user);
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
            userModel.findByIdAndRemove(user.username.toLowerCase(), (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(user);
            });
        });
    }
}
function getUserKeyType(key) {
    return userModel.schema.paths[key].instance.toLowerCase();
}
exports.db = new MongoDB();
//# sourceMappingURL=MongodDB.js.map