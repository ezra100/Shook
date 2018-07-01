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
        this.post('findOne', fn);
        this.post('find', function (docs, next) {
            Array.prototype.forEach.call(docs, (doc) => fn(doc, () => { }));
            next();
        });
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
    let update = this.getUpdate();
    delete update.username;
    next();
});
let productSchema = new Schema({
    creationDate: { type: Date, default: Date.now, index: true },
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
    creationDate: { type: Date, default: Date.now, index: true },
    username: { type: String, required: true, ref: 'User' },
    productID: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    title: { type: String, required: true, minlength: 5, maxlength: 140 },
    fullReview: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    likes: [{ type: String, required: true }],
    // the count is for cases when the likes array is spliced (for optimization)
    // it isn't required for insertion, but supposed to created in the post find hooks
    likesCount: Number,
    dislikes: [{ type: String, required: true }],
    dislikesCount: Number,
});
let commentSchema = new Schema({
    username: { type: String, required: true, ref: 'User' },
    creationDate: { type: Date, default: Date.now, index: true },
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
    likesCount: Number,
    dislike: [{ type: String, required: true }],
    dislikesCount: Number,
});
//#region hooks
// productSchema.preAnyUpdate(function(next: Function) {
//   delete this.getUpdate().username;
//   next();
// });
// productSchema.postAnyFInd(function(
//     doc: mongoose.Document, next: Function): void {
//   console.log(doc);
//   next();
// });
// reviewSchema.preAnyUpdate(function(next: Function): void {
//   delete this.getUpdate().productID;  // don't change the product id
//   delete this.getUpdate().username;
//   next();
// });
reviewSchema.postAnyFInd(function (doc, next) {
    let d = doc;
    if (d.likes && d.dislikes) {
        d.likesCount = d.likes.length;
        d.dislikesCount = d.dislikes.length;
    }
    next();
});
// commentSchema.preAnyUpdate(function(next: Function): void {
//   delete (<any>this).reviewID;  // prevent changing the review id
//   delete (<any>this).username;  // prevent changing the username
//   next();
// });
commentSchema.postAnyFInd(function (doc, next) {
    let d = doc;
    if (d.likes && d.dislikes) {
        d.likesCount = d.likes.length;
        d.dislikesCount = d.dislikes.length;
    }
    next();
});
productSchema.preAnyUpdate(function (next) {
    let update = this.getUpdate();
    delete update.username;
    delete update.creationDate;
    next();
});
reviewSchema.preAnyUpdate(function (next) {
    let update = this.getUpdate();
    delete update.username;
    delete update.creationDate;
    delete update.productID;
    next();
});
commentSchema.preAnyUpdate(function (next) {
    let update = this.getUpdate();
    delete update.username;
    delete update.creationDate;
    delete update.reviewID;
    next();
});
//#endregion
exports.userModel = mongoose.model('User', userSchema);
exports.userAuthDataModel = mongoose.model('UserData', userDataSchema);
exports.productModel = mongoose.model('Product', productSchema);
exports.reviewModel = mongoose.model('Review', reviewSchema);
exports.commentModel = mongoose.model('Comment', commentSchema);
//# sourceMappingURL=Models.js.map