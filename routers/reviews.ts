import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {IReview} from '../types';
import {LIMIT} from "../constants";

export var router = express.Router();

router.post(
    '/add', helpers.asyncWrapper(async function(req: express.Request, res: express.Response) {
      let review: IReview = req.body;
      review.owner = req.user._id;
      review = await db.addReview(review);
      res.status(201).json(review);
    }));

router.put('/update', helpers.asyncWrapper(async function(req, res) {
  let review: IReview = req.body;
  review = await db.updateReview(review, req.user._id);
  res.status(201).json(review);
}));

router.get('/getByID', helpers.asyncWrapper(async function(req, res) {
  let id: string = req.query._id || req.query.id;
  res.json(await db.getReviewByID(id));
}));

router.get('/getLatest', helpers.asyncWrapper(async function(req, res) {
  let filter: any = {};
  let username = req.query.username;
  // from the likes/dislikes array - how many elements to show
  if (req.query.username) {
    filter.owner = new RegExp(helpers.escapeRegExp(username), 'i');
  }
  if (req.query.productID) {
    filter.productID = req.query.productID;
  } 
  let limit = Number(req.query.limit)  || LIMIT;
  let offset = Number(req.query.offset || 0);
  let products = await db.getLatestReviews(filter, offset, limit);
  res.json(products);
}));

router.delete('/delete', helpers.asyncWrapper(async function(req, res) {
  let id = req.query._id || req.query.id;
  let recursive = req.query.recursive !== "false";
  let oldReview = await db.getReviewByID(id);
  if (oldReview.owner.toLowerCase() === req.user._id.toLowerCase()) {
    db.deleteReview(id, recursive);
    res.end(id + ' deleted successfully');
  } else {
    res.status(401).end('You\'re not the owner of ' + id);
  }
}));

router.put("/like", helpers.asyncWrapper(async function(req, res){
  let id= req.query._id || req.query.id;
  if(!req.user){
    res.status(401).end("you're not logged in");
    return;
  }
  res.json(await db.likeReview(id, req.user._id));

}));

router.put("/dislike", helpers.asyncWrapper(async function(req, res){
  let id= req.query._id || req.query.id;
  if(!req.user){
    res.status(401).end("you're not logged in");
    return;
  }
  res.json(await db.dislikeReview(id, req.user._id));
}));

// removes both likes and dislikes
router.put(/\/removeLike/i, helpers.asyncWrapper(async function(req, res){
  let id= req.query._id || req.query.id;
  if(!req.user){
    res.status(401).end("you're not logged in");
    return;
  }
  res.json(await db.removeLikeDislikeFromReview(id, req.user._id));
}));