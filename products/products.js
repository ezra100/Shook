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
        let product = req.body;
        product.username = req.user.username;
        product = yield MongoDB_1.db.addProduct(product);
        res.status(201).json(product);
    });
});
exports.router.put('/update', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let product = req.body;
        product = yield MongoDB_1.db.updateProduct(product, req.user.username);
        res.status(201).json(product);
    });
});
exports.router.get('/getByID', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query.id;
        res.json(yield MongoDB_1.db.getProductByID(id));
    });
});
exports.router.get('/getLatest', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let filter = {};
        let username = req.query.username;
        if (req.query.username) {
            filter.username = new RegExp(helpers_1.helpers.escapeRegExp(username), 'i');
        }
        let limit = Number(req.query.limit) || constants_1.LIMIT;
        let offset = Number(req.query.offset || 0);
        res.json(yield MongoDB_1.db.getLatestProducts(filter, offset, limit));
    });
});
exports.router.delete('/delete', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query._id || req.query.id;
        let recursive = req.query.recursive;
        let oldReview = yield MongoDB_1.db.getProductByID(id);
        if (oldReview.username.toLowerCase() === req.user.username.toLowerCase()) {
            MongoDB_1.db.deleteProduct(id, recursive);
            res.end(id + ' deleted successfully');
        }
        else {
            res.status(401).end('You\'re not the owner of ' + id);
        }
    });
});
exports.router.get('/getAvgRating', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let id = req.query.id;
        let rating = yield MongoDB_1.db.getProductRating(id);
        res.json(rating);
    });
});
exports.router.get(/\/myFeed/i, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let dbRes = yield MongoDB_1.db.getProductsFromFollowees(req.user.username);
        res.json(dbRes);
    });
});
//# sourceMappingURL=products.js.map