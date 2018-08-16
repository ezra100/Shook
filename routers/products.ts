import * as express from 'express';

import {LIMIT} from '../constants';
import {Products} from '../DB/Models';
import {helpers} from '../helpers';
import {Product} from '../types';

export var router = express.Router();

router.post(
    '/add',
    helpers.asyncWrapper(
        async function(req: express.Request, res: express.Response) {
          let product: Product = req.body;
          if(!req.user ){
            throw "You're not logged in";
          }
          product.owner = req.user._id;
          product = await Products.addProduct(product);
          res.status(201).json(product);
        }));

router.put('/update', helpers.asyncWrapper(async function(req, res) {
  let product: Product = req.body;

  product = await Products.updateProduct(product, req.user._id);
  res.status(201).json(product);
}));

router.get('/getByID', helpers.asyncWrapper(async function(req, res) {
  let id: string = req.query.id;
  let product = await Products.getProductByID(id);
  res.json(product);
}));

router.get('/getLatest', helpers.asyncWrapper(async function(req, res) {
  let filter: any = JSON.parse(req.query.filter) || {};
  if (filter.date) {
    if (filter.date.$lt) {
      filter.date.$lt = new Date(filter.date.$lt);
    }
    if (filter.date.$gte) {
      filter.date.$gte = new Date(filter.date.$gte);
    }
  }
  let limit = Number(req.query.limit) || LIMIT;
  let offset = Number(req.query.offset || 0);
  res.json(await Products.getLatestProducts(filter, offset, limit));
}));

router.delete('/delete', helpers.asyncWrapper(async function(req, res) {
  let id = req.query._id || req.query.id;
  let recursive = req.query.recursive !== 'false';
  let oldReview = await Products.getProductByID(id);
  if (oldReview.owner === req.user._id) {
    Products.deleteProduct(id, recursive);
    res.end(id + ' deleted successfully');
  } else {
    res.status(401).end('You\'re not the owner of ' + id);
  }
}));

router.get('/getAvgRating', helpers.asyncWrapper(async function(req, res) {
  let id = req.query.id;
  let rating = await Products.getProductRating(id);
  res.json(rating);
}));

router.get(/\/myFeed/i, helpers.asyncWrapper(async function(req, res) {
  let dbRes = await Products.getProductsFromFollowees(req.user._id);
  res.json(dbRes);
}));
