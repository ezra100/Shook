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
const constants_1 = require("../constants");
exports.router = express.Router();
exports.router.post('/add', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let review = req.body;
        review.owner = req.user._id;
        review = yield MongoDB_1.db.addReview(review);
        res.status(201).json(review);
    });
});
exports.router.put('/update', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let review = req.body;
        review = yield MongoDB_1.db.updateReview(review, req.user._id);
        res.status(201).json(review);
    });
});
exports.router.get('/getByID', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query._id || req.query.id;
        res.json(yield MongoDB_1.db.getReviewByID(id));
    });
});
exports.router.get('/getLatest', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let filter = {};
        let username = req.query.username;
        // from the likes/dislikes array - how many elements to show
        if (req.query.username) {
            filter.owner = new RegExp(helpers_1.helpers.escapeRegExp(username), 'i');
        }
        if (req.query.productID) {
            filter.productID = req.query.productID;
        }
        let limit = Number(req.query.limit) || constants_1.LIMIT;
        let offset = Number(req.query.offset || 0);
        let products = yield MongoDB_1.db.getLatestReviews(filter, offset, limit);
        res.json(products);
    });
});
exports.router.delete('/delete', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query._id || req.query.id;
        let recursive = req.query.recursive;
        let oldReview = yield MongoDB_1.db.getReviewByID(id);
        if (oldReview.owner.toLowerCase() === req.user._id.toLowerCase()) {
            MongoDB_1.db.deleteReview(id, recursive);
            res.end(id + ' deleted successfully');
        }
        else {
            res.status(401).end('You\'re not the owner of ' + id);
        }
    });
});
exports.router.put("/like", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query._id || req.query.id;
        if (!req.user) {
            res.status(401).end("you're not logged in");
            return;
        }
        res.json(yield MongoDB_1.db.likeReview(id, req.user._id));
    });
});
exports.router.put("/dislike", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query._id || req.query.id;
        if (!req.user) {
            res.status(401).end("you're not logged in");
            return;
        }
        res.json(yield MongoDB_1.db.dislikeReview(id, req.user._id));
    });
});
// removes both likes and dislikes
exports.router.put(/\/removeLike/i, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query._id || req.query.id;
        if (!req.user) {
            res.status(401).end("you're not logged in");
            return;
        }
        res.json(yield MongoDB_1.db.removeLikeDislikeFromReview(id, req.user._id));
    });
});
//# sourceMappingURL=reviews.js.map