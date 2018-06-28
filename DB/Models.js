"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
// define a schema
// let Schema: any = mongoose.Schema;
class Schema extends mongoose.Schema {
    preAnyUpdate(func) {
        this.pre('update', func);
        this.pre('updateOne', func);
        this.pre('updateMany', func); // not sure this will work well, since it's many
        this.pre('findOneAndUpdate', func);
    }
    postAnyFInd(fn) {
        this.post('find', fn);
        this.post('findOne', fn);
        return this;
    }
}
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
        required: function () {
            return helpers_1.helpers.validateEmail(this.email);
        },
        unique: true
    },
    gender: {
        type: Number,
        required: function () {
            return this.gender in types_1.Gender;
        }
    },
    address: { type: String, required: true },
    imageURL: {
        type: String,
        required: function () {
            return helpers_1.helpers.isValidURL(this.imageURL);
        }
    },
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
userSchema.preAnyUpdate(function (next) {
    delete this.getUpdate().username;
    next();
});
let productSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    creationDate: { type: Date, default: Date.now },
    title: { type: String, required: true, minlength: 6, maxlength: 140 },
    subtitle: { type: String, required: true },
    username: { type: String, required: true, ref: 'User' },
    link: {
        type: String,
        required: function () {
            return !this.link || helpers_1.helpers.isValidURL(this.link);
        }
    },
});
let reviewSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true },
    creationDate: { type: Date, default: Date.now },
    username: { type: String, required: true, ref: 'User' },
    productID: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    title: { type: String, required: true, minlength: 5, maxlength: 140 },
    fullReview: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    helpful: [{ type: String, required: true }],
    notHelpful: [{ type: String, required: true }],
});
let commentSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    username: { type: String, required: true, ref: 'User' },
    creationDate: { type: Date, default: Date.now },
    reviewID: {
        type: Schema.Types.ObjectId,
        ref: 'Review',
        required: true
    },
    comment: { type: String, minlength: 1, required: true },
    likes: [{
            type: String,
            required: true
        }],
    dislike: [{ type: String, required: true }],
});
//#region hooks
productSchema.preAnyUpdate(function (next) {
    delete this.getUpdate().username;
    next();
});
productSchema.pre('save', function (next) {
    if (typeof this._id === 'string') {
        this._id = new mongoose.Schema.Types.ObjectId(this._id);
    }
    next();
});
productSchema.postAnyFInd(function (doc, next) {
    console.log(doc);
    next();
});
reviewSchema.preAnyUpdate(function (next) {
    delete this.getUpdate().productID; // don't change the product id
    delete this.getUpdate().username;
    next();
});
reviewSchema.pre('save', function (next) {
    if (typeof this._id === 'string') {
        this._id = new mongoose.Schema.Types.ObjectId(this._id);
    }
    let th = this;
    if (typeof th.productID === 'string') {
        th.productID = new mongoose.Schema.Types.ObjectId(th.productID);
    }
    next();
});
reviewSchema.postAnyFInd(function (doc, next) {
    this._id = this._id.toString();
    this.productID = this.productID.toString();
    next();
});
commentSchema.pre('save', function (next) {
    if (typeof this._id === 'string') {
        this._id = new mongoose.Schema.Types.ObjectId(this._id);
    }
    let th = this;
    if (typeof th.reviewID === 'string') {
        th.reviewID = new mongoose.Schema.Types.ObjectId(th.reviewID);
    }
    next();
});
commentSchema.preAnyUpdate(function (next) {
    delete this.reviewID; // prevent changing the review id
    delete this.username; // prevent changing the username
    next();
});
commentSchema.postAnyFInd(function (doc, next) {
    console.log(doc);
    next();
});
//#endregion
exports.userModel = mongoose.model('User', userSchema);
exports.userAuthDataModel = mongoose.model('UserData', userDataSchema);
exports.productModel = mongoose.model('Product', productSchema);
exports.reviewModel = mongoose.model('Review', reviewSchema);
exports.commentModel = mongoose.model('Comment', commentSchema);
//# sourceMappingURL=Models.js.map