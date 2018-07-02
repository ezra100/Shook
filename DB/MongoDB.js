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
let ObjectId = mongoose.Types.ObjectId;
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
            return (yield Models_1.userAuthDataModel.findById(username)).toObject();
        });
    }
    updateUserAuthData(username, data) {
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
                    if (key === '_id') {
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
    addFollowee(follower, followee) {
        return __awaiter(this, void 0, void 0, function* () {
            followee = followee.toLowerCase();
            follower = follower.toLowerCase();
            // validate the followee, we assume the follower is validated by the calling
            // function
            let doc = (yield Models_1.userModel.findById(followee).exec());
            if (!doc) {
                return 'followee doesn\'t exist';
            }
            return (yield Models_1.userModel
                .update({ _id: follower.toLowerCase() }, { $addToSet: { follows: followee } })
                .exec());
        });
    }
    removeFollowee(follower, followee) {
        return __awaiter(this, void 0, void 0, function* () {
            followee = followee.toLowerCase();
            follower = follower.toLowerCase();
            return (yield Models_1.userModel
                .update({ _id: follower.toLowerCase() }, { $pull: { follows: followee } })
                .exec());
        });
    }
    updateUserById(username, user) {
        user = {
            address: user.address,
            email: user.email,
            imageURL: user.imageURL,
            gender: user.gender,
            firstName: user.firstName,
            lastName: user.lastName
        };
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
            Models_1.userModel.findByIdAndRemove(user._id, (err, user) => {
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
    updateProduct(product, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            product = {
                link: product.link,
                subtitle: product.subtitle,
                title: product.title
            };
            return (yield Models_1.productModel.findOneAndUpdate({ _id: product._id, owner: owner || 'block undefined' }, product, { new /* return the new document*/: true }))
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
    getProductsFromFollowees(username, offset = 0, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let followees = (yield Models_1.userModel.findById(username)).toObject().follows;
            let agg = Models_1.productModel.aggregate()
                .match({ 'owner': { $in: followees } })
                .sort('-creationDate')
                .skip(offset);
            if (limit) {
                agg.limit(limit);
            }
            return yield agg;
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
    updateReview(review, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            review = {
                title: review.title,
                rating: review.rating,
                fullReview: review.fullReview
            };
            return (yield Models_1.reviewModel.findOneAndUpdate({ _id: review._id, owner: owner || 'block undefined' }, review, { new /* return the new document*/: true }))
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
            let results = (yield Models_1.reviewModel.remove({ productID: new ObjectId(productID) }));
            return results;
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
    likeReview(id, username) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.reviewModel
                .update({ _id: id }, { $addToSet: { likes: username }, $pull: { dislikes: username } })
                .exec());
        });
    }
    dislikeReview(id, username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Models_1.reviewModel
                .update({ _id: id }, { $pull: { likes: username }, $addToSet: { dislikes: username } })
                .exec();
        });
    }
    removeLikeDislikeFromReview(id, username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Models_1.reviewModel
                .update({ _id: id }, { $pull: { likes: username, dislikes: username } })
                .exec();
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
            let results = yield Models_1.commentModel.remove({ reviewID: new ObjectId(reviewID) });
            return results;
        });
    }
    updateComment(comment, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            comment = { comment: comment.comment };
            return (yield Models_1.commentModel.findOneAndUpdate({ _id: comment._id, owner: owner || 'block undefined' }, comment, { new: /* return the new document*/ true }))
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
    likeComment(id, username) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Models_1.commentModel
                .update({ _id: id }, { $addToSet: { likes: username }, $pull: { dislikes: username } })
                .exec());
        });
    }
    dislikeComment(id, username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Models_1.commentModel
                .update({ _id: id }, { $pull: { likes: username }, $addToSet: { dislikes: username } })
                .exec();
        });
    }
    removeLikeDislikeFromComment(id, username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Models_1.commentModel
                .update({ _id: id }, { $pull: { likes: username, dislikes: username } })
                .exec();
        });
    }
}
function getUserKeyType(key) {
    return Models_1.userModel.schema.paths[key].instance.toLowerCase();
}
exports.db = new MongoDB();
//# sourceMappingURL=MongoDB.js.map