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
        let product = req.body;
        product.username = req.user.username;
        product = yield MongoDB_1.db.addProduct(product);
        res.status(201).json(product);
    });
});
exports.router.put('/update', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let product = req.body;
        product.username = req.user.username;
        let oldProduct = yield MongoDB_1.db.getProductByID(product._id);
        if (req.user.username !== oldProduct.username) {
            res.status(401).end();
            return;
        }
        product = yield MongoDB_1.db.updateProduct(product);
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
        let limit = req.query.limit ? Number(req.query.limit) : undefined;
        let offset = Number(req.query.offset || 0);
        res.json(yield MongoDB_1.db.getLatestProducts(filter, offset, limit));
    });
});
//# sourceMappingURL=product.js.map