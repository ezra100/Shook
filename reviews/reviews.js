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
const helpers_1 = require("../helpers");
exports.router = express.Router();
exports.router.post('/add', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let review = req.body;
        review.username = req.user.username;
        review = yield MongoDB_1.db.addReview(review);
        res.status(201).json(review);
    });
});
exports.router.put('/update', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let review = req.body;
        review.username = req.user.username;
        let oldReview = yield MongoDB_1.db.getReviewByID(review._id);
        if (req.user.username !== oldReview.username) {
            res.status(401).end('You\'re not the owner of the review');
            return;
        }
        review = yield MongoDB_1.db.updateReview(review);
        res.status(201).json(review);
    });
});
exports.router.get('/getByID', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query.id;
        res.json(yield MongoDB_1.db.getReviewByID(id));
    });
});
exports.router.get('/getLatest', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let filter = {};
        let username = req.query.username;
        // from the likes/dislikes array - how many elements to show
        let likesLimit = Number(req.query.likesArrLimit) || 10;
        if (req.query.username) {
            filter.username = new RegExp(helpers_1.helpers.escapeRegExp(username), 'i');
        }
        if (req.query.productID) {
            filter.productID = req.query.productID;
        }
        let limit = req.query.limit ? Number(req.query.limit) : undefined;
        let offset = Number(req.query.offset || 0);
        let products = yield MongoDB_1.db.getLatestReviews(filter, offset, limit);
        products.forEach((product) => {
            product.likes.splice(likesLimit);
            product.dislikes.splice(likesLimit);
        });
        res.json(products);
    });
});
exports.router.delete('/delete', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query._id;
        let recursive = req.query.recursive;
        let oldReview = yield MongoDB_1.db.getReviewByID(id);
        if (oldReview.username.toLowerCase() === req.user.username.toLowerCase()) {
            MongoDB_1.db.deleteReview(id, recursive);
            res.end(id + ' deleted successfully');
        }
        else {
            res.status(401).end('You\'re not the owner of ' + id);
        }
    });
});
//# sourceMappingURL=reviews.js.map