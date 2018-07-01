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
const helpers_1 = require("../helpers");
const Models_1 = require("./Models");
// set up default mongoose connection
var connectionString = 'mongodb://127.0.0.1/shook';
mongoose.connect(connectionString);
// get the default connection
exports.mongoConnection = mongoose.connection;
// bind connection to error event (to get notification of connection errors)
exports.mongoConnection.on('error', console.error.bind(console, 'MongoDB connection error:'));
class MongoDB {
    getUserAuthData(username) {
        return __awaiter(this, void 0, void 0, function* () {
            username = username.toLowerCase();
            return (yield Models_1.userAuthDataModel.findById(username)).toObject();
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
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.userModel.findOne({ email: email })).toObject();
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
                    if (key === 'username') {
                        // it it's username, just make sure that the search is case
                        // insensitive
                        filter[key] = new RegExp(helpers_1.helpers.escapeRegExp(filter[key]), 'i');
                    }
                    else {
                        // replace it with a regex that will search for any one of the given
                        // words
                        filter[key] = new RegExp(filter[key]
                            .split(/\s+/)
                            // escape regex characters
                            .map((v) => v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
                            .join('|'), 'gi');
                    }
                    break;
                case 'boolean':
                    if (typeof filter[key] === 'string') {
                        filter[key] = (filter[key] === 'true');
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
            Models_1.userModel.findById(username.toLowerCase(), (err, user) => {
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
    //#region  product
    addProduct(product, secure = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (secure) {
                product.creationDate = new Date();
            }
            return (yield Models_1.productModel.create(product)).toObject();
        });
    }
    updateProduct(product) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.productModel.findByIdAndUpdate(product._id, product, { new /* return the new document*/: true }))
                .toObject();
        });
    }
    deleteProduct(id, removeReviews = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (removeReviews) {
                this.deleteReviewsByProductID(id);
            }
            return (yield Models_1.productModel.findByIdAndRemove(id)).toObject();
            ;
        });
    }
    getProductByID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.productModel.findById(id)).toObject();
        });
    }
    getLatestProducts(filter = {}, offset = 0, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = Models_1.productModel.find(filter).sort('-creationDate').skip(offset);
            if (limit) {
                res.limit(limit);
            }
            return (yield res.exec()).map(doc => doc.toObject());
        });
    }
    //#endregion
    //#region review
    addReview(review, secure = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (secure) {
                review.dislikes = [];
                review.likes = [];
                review.creationDate = new Date();
            }
            return (yield Models_1.reviewModel.create(review)).toObject();
        });
    }
    updateReview(review) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.reviewModel.findByIdAndUpdate(review._id, review, { new /* return the new document*/: true }))
                .toObject();
        });
    }
    deleteReview(id, removeComments = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (removeComments) {
                this.deleteCommentsByReviewID(id);
            }
            return (yield Models_1.reviewModel.findByIdAndRemove(id)).toObject();
        });
    }
    deleteReviewsByProductID(productID) {
        return __awaiter(this, void 0, void 0, function* () {
            let reviews = yield this.getLatestReviews({ productID: productID });
            reviews.forEach((review) => {
                this.deleteCommentsByReviewID(review._id);
            });
            Models_1.reviewModel.deleteMany({ productID });
        });
    }
    getReviewByID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.reviewModel.findById(id)).toObject();
        });
    }
    getLatestReviews(filter = {}, offset = 0, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = Models_1.reviewModel.find(filter).sort('-creationDate').skip(offset);
            if (limit) {
                res.limit(limit);
            }
            return (yield res.exec()).map(doc => doc.toObject());
        });
    }
    getProductRating(productID) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.reviewModel.aggregate()
                .match({ productID: mongoose.Types.ObjectId(productID) })
                .group({ _id: '$productID', avg: { $avg: '$rating' } }))[0]
                .avg;
        });
    }
    //#endregion
    //#region comment
    addComment(comment, secure = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (secure) {
                comment.creationDate = new Date();
                comment.dislikes = [];
                comment.likes = [];
            }
            return (yield Models_1.commentModel.create(comment)).toObject();
        });
    }
    deleteComment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            Models_1.commentModel.findByIdAndRemove(id);
        });
    }
    deleteCommentsByReviewID(reviewID) {
        return __awaiter(this, void 0, void 0, function* () {
            Models_1.commentModel.deleteMany({ reviewID });
        });
    }
    updateComment(comment) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.commentModel.findByIdAndUpdate(comment._id, comment, { new: /* return the new document*/ true }))
                .toObject();
        });
    }
    getCommentByID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.commentModel.findById(id)).toObject();
        });
    }
    getLatestComments(filter = {}, offset = 0, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = Models_1.commentModel.find(filter).sort('-creationDate').skip(offset);
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