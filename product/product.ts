import * as express from 'express';

import {db} from '../DB/MongoDB';
import {IProduct} from '../types';


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
  product.username = req.user.username;
  let oldProduct = await db.getProductByID(product._id);
  if (req.user.username != oldProduct.username) {
    res.status(401).end();
    return;
  }
  product = await db.updateProduct(product);
  res.status(201).json(product);
});

router.get('/getByID', async function(req, res) {
  let id: string = req.query.id;
  res.json(await db.getProductByID(id));
});

router.get('/getLatest', async function(req, res) {
  let username = req.query.username || undefined;
  let limit =  req.query.limit ? Number(req.query.limit) : undefined;
  let offset = Number( req.query.offset || 0);
  res.json(await db.getLatestProducts(username, offset, limit));
});