import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {IReview} from '../types';


export var router = express.Router();

router.post(
    '/add', async function(req: express.Request, res: express.Response) {
      let review: IReview = req.body;
      review.username = req.user.username;
      review = await db.addReview(review);
      res.status(201).json(review);
    });

router.put('/update', async function(req, res) {
  let review: IReview = req.body;
  review.username = req.user.username;
  let oldReview = await db.getReviewByID(review._id);
  if (req.user.username !== oldReview.username) {
    res.status(401).end('You\'re not the owner of the review');
    return;
  }
  review = await db.updateReview(review);
  res.status(201).json(review);
});

router.get('/getByID', async function(req, res) {
  let id: string = req.query.id;
  res.json(await db.getReviewByID(id));
});

router.get('/getLatest', async function(req, res) {
  let filter: any = {};
  let username = req.query.username;
  // from the likes/dislikes array - how many elements to show
  let likesLimit = Number(req.query.likesArrLimit) || 10;
  if (req.query.username) {
    filter.username = new RegExp(helpers.escapeRegExp(username), 'i');
  }
  if (req.query.productID) {
    filter.productID = req.query.productID;
  }
  let limit = req.query.limit ? Number(req.query.limit) : undefined;
  let offset = Number(req.query.offset || 0);
  let products = await db.getLatestReviews(filter, offset, limit);
  products.forEach((product) => {
    product.likes.splice(likesLimit);
    product.dislikes.splice(likesLimit);
  });
  res.json(products);
});

router.delete('/delete', async function(req, res) {
  let id = req.query._id;
  let recursive = req.query.recursive;
  let oldReview = await db.getReviewByID(id);
  if (oldReview.username.toLowerCase() === req.user.username.toLowerCase()) {
    db.deleteReview(id, recursive);
    res.end(id + ' deleted successfully');
  } else {
    res.status(401).end('You\'re not the owner of ' + id);
  }
});