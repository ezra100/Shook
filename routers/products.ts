import * as express from 'express';

import {LIMIT} from '../constants';
import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {IProduct} from '../types';

export var router = express.Router();

router.post(
    '/add', async function(req: express.Request, res: express.Response) {
      let product: IProduct = req.body;
      product.owner = req.user._id;
      product = await db.addProduct(product);
      res.status(201).json(product);
    });

router.put('/update', helpers.asyncWrapper(async function(req, res) {
  let product: IProduct = req.body;

  product = await db.updateProduct(product, req.user._id);
  res.status(201).json(product);
}));

router.get('/getByID', helpers.asyncWrapper(async function(req, res) {
  let id: string = req.query.id;
  let product = await db.getProductByID(id);
  res.json(product);
}));

router.get('/getLatest', helpers.asyncWrapper(async function(req, res) {
  let filter: any = {};
  let username = req.query.username;
  if (req.query.username) {
    filter.owner = new RegExp(helpers.escapeRegExp(username), 'i');
  }
  if (req.query.before) {
    filter.creationDate = {$gte: new Date(req.query.before)};
  }
  let limit = Number(req.query.limit) || LIMIT;
  let offset = Number(req.query.offset || 0);
  res.json(await db.getLatestProducts(filter, offset, limit));
}));

router.delete('/delete', helpers.asyncWrapper(async function(req, res) {
  let id = req.query._id || req.query.id;
  let recursive = req.query.recursive !== 'false';
  let oldReview = await db.getProductByID(id);
  if (oldReview.owner === req.user._id) {
    db.deleteProduct(id, recursive);
    res.end(id + ' deleted successfully');
  } else {
    res.status(401).end('You\'re not the owner of ' + id);
  }
}));

router.get('/getAvgRating', helpers.asyncWrapper(async function(req, res) {
  let id = req.query.id;
  let rating = await db.getProductRating(id);
  res.json(rating);
}));

router.get(/\/myFeed/i, helpers.asyncWrapper(async function(req, res) {
  let dbRes = await db.getProductsFromFollowees(req.user._id);
  res.json(dbRes);
}));
