import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {IComment} from '../types';
import {LIMIT} from '../constants';

export var router = express.Router();

router.post(
    '/add', async function(req: express.Request, res: express.Response) {
      let comment: IComment = req.body;
      comment.owner = req.user._id;

      comment = await db.addComment(comment);
      res.status(201).json(comment);
    });

router.put('/update', helpers.asyncWrapper(async function(req, res) {
  let comment: IComment = req.body;
  comment = await db.updateComment(comment, req.user._id);
  res.status(201).json(comment);
}));

router.get('/getByID', helpers.asyncWrapper(async function(req, res) {
  let id: string = req.query._id || req.query.id ;
  res.json(await db.getCommentByID(id));
}));

router.get('/getLatest', helpers.asyncWrapper(async function(req, res) {
  let filter: any = {};
  let username = req.query.username;  
  // from the likes/dislikes array - how many elements to show
  if (username) {
    filter._id = new RegExp(helpers.escapeRegExp(username), 'i');
  }
  if (req.query.reviewID) {
    filter.reviewID = req.query.reviewID;
  }
  let limit = Number(req.query.limit) || LIMIT;
  let offset = Number(req.query.offset || 0);
  let products = await db.getLatestComments(filter, offset, limit);
  res.json(products);
}));

router.delete('/delete', helpers.asyncWrapper(async function(req, res) {
  let id = req.query._id || req.query.id;
  let oldComment = await db.getCommentByID(id);
  if (oldComment.owner === req.user._id) {
    db.deleteComment(id);
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
  res.json(await db.likeComment(id, req.user._id));
}));

router.put("/dislike", helpers.asyncWrapper(async function(req, res){
  let id= req.query._id || req.query.id;
  if(!req.user){
    res.status(401).end("you're not logged in");
    return;
  }
  res.json(await db.dislikeComment(id, req.user._id));
}));

// removes both likes and dislikes
router.put(/\/removeLike/i, helpers.asyncWrapper(async function(req, res){
  let id= req.query._id || req.query.id;
  if(!req.user){
    res.status(401).end("you're not logged in");
    return;
  }
  res.json(await db.removeLikeDislikeFromComment(id, req.user._id));
}));