import * as express from 'express';

import {Reviews} from '../DB/Models';
import {helpers} from '../helpers';
import {Review} from '../types';
import {LIMIT} from "../constants";

export var router = express.Router();

router.post(
    '/add', helpers.asyncWrapper(async function(req: express.Request, res: express.Response) {
      let review: Review = req.body;
      review.owner = req.user._id;
      review = await Reviews.addReview(review);
      res.status(201).json(review);
    }));

router.put('/update', helpers.asyncWrapper(async function(req, res) {
  let review: Review = req.body;
  review = await Reviews.updateReview(review, req.user._id);
  res.status(201).json(review);
}));

router.get('/getByID', helpers.asyncWrapper(async function(req, res) {
  let id: string = req.query._id || req.query.id;
  res.json(await Reviews.getReviewByID(id));
}));

router.get('/getLatest', helpers.asyncWrapper(async function(req, res) {
  let filter = req.query;
  if(filter.date){
    for(let key in filter.date){
      filter.date[key] = new Date(filter.date[key]);
    }
  }
  let limit = Number(req.query.limit)  || LIMIT;
  let offset = Number(req.query.offset || 0);
  let products = await Reviews.getLatestReviews(filter, offset, limit);
  res.json(products);
}));

router.delete('/delete', helpers.asyncWrapper(async function(req, res) {
  let id = req.query._id || req.query.id;
  let oldReview = await Reviews.getReviewByID(id);
  if (oldReview.owner.toLowerCase() === req.user._id.toLowerCase()) {
    Reviews.deleteReview(id);
    res.end(id + ' deleted successfully');
  } else {
    res.status(401).end('You\'re not the owner of ' + id);
  }
}));

router.put("/like", helpers.asyncWrapper(async function(req, res){
  let id= req.body._id || req.body.id;
  if(!req.user){
    res.status(401).end("you're not logged in");
    return;
  }
  res.json(await Reviews.likeReview(id, req.user._id));

}));

router.put("/dislike", helpers.asyncWrapper(async function(req, res){
  let id= req.body._id || req.body.id;
  if(!req.user){
    res.status(401).end("you're not logged in");
    return;
  }
  res.json(await Reviews.dislikeReview(id, req.user._id));
}));

// removes both likes and dislikes
router.put(/\/removeLike/i, helpers.asyncWrapper(async function(req, res){
  let id= req.body._id || req.body.id;
  if(!req.user){
    res.status(401).end("you're not logged in");
    return;
  }
  res.json(await Reviews.removeLikeDislikeFromReview(id, req.user._id));
}));