import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {IProduct} from '../types';
import {LIMIT} from "../constants";

export var router = express.Router();

router.post(
    '/add', async function(req: express.Request, res: express.Response) {
      let product: IProduct = req.body;
      product.username = req.user.username;
      product = await db.addProduct(product);
      res.status(201).json(product);
    });

router.put('/update', async function(req, res) {
  let product: IProduct = req.body;

  product = await db.updateProduct(product, req.user.username);
  res.status(201).json(product);
});

router.get('/getByID', async function(req, res) {
  let id: string = req.query.id;
  res.json(await db.getProductByID(id));
});

router.get('/getLatest', async function(req, res) {
  let filter: any = {};
  let username = req.query.username;
  if (req.query.username) {
    filter.username = new RegExp(helpers.escapeRegExp(username), 'i');
  }
  let limit = Number(req.query.limit) || LIMIT;
  let offset = Number(req.query.offset || 0);
  res.json(await db.getLatestProducts(filter, offset, limit));
});

router.delete('/delete', async function(req, res) {
  let id = req.query._id || req.query.id;
  let recursive = req.query.recursive;
  let oldReview = await db.getProductByID(id);
  if (oldReview.username.toLowerCase() === req.user.username.toLowerCase()) {
    db.deleteProduct(id, recursive);
    res.end(id + ' deleted successfully');
  } else {
    res.status(401).end('You\'re not the owner of ' + id);
  }
});

router.get('/getAvgRating', async function(req, res) {
  let id = req.query.id;
  let rating = await db.getProductRating(id);
  res.json(rating);
});

router.get(/\/myFeed/i, async function(req, res){
  let dbRes = await db.getProductsFromFollowees(req.user.username);
  res.json(dbRes);
});