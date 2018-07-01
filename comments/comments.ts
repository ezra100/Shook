import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {IComment} from '../types';


export var router = express.Router();

router.post(
    '/add', async function(req: express.Request, res: express.Response) {
      let comment: IComment = req.body;
      comment.username = req.user.username;

      comment = await db.addComment(comment);
      res.status(201).json(comment);
    });

router.put('/update', async function(req, res) {
  let comment: IComment = req.body;
  comment.username = req.user.username;
  let oldComment = await db.getCommentByID(comment._id);
  if (req.user.username !== oldComment.username) {
    res.status(401).end("You're not the owner of the comment");
    return;
  }
  comment = await db.updateComment(comment);
  res.status(201).json(comment);
});

router.get('/getByID', async function(req, res) {
  let id: string = req.query.id;
  res.json(await db.getCommentByID(id));
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
  let products = await db.getLatestComments(filter, offset, limit);
  products.forEach((product) => {
    product.likes.splice(likesLimit);
    product.dislikes.splice(likesLimit);
  });
  res.json(products);
});

router.delete('/delete', async function(req, res) {
  let id = req.query._id;
  let recursive = req.query.recursive;
  let oldComment = await db.getCommentByID(id);
  if (oldComment.username.toLowerCase() === req.user.username.toLowerCase()) {
    db.deleteComment(id);
    res.end(id + ' deleted successfully');
  } else {
    res.status(401).end('You\'re not the owner of ' + id);
  }
});