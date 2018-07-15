import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {DMessage} from '../types';

export var router = express.Router();


router.post('/send', helpers.asyncWrapper(async function(req, res) {
  if (!req.user) {
    res.status(401).end('You\'re not logged in');
    return;
  }
  let to = req.body.to;
  let content = req.body.content;
  let message:
      DMessage = {from: req.user._id, to, content, date: new Date()};
  res.json(db.addDMessage(message));
}));

router.get("/messages", helpers.asyncWrapper(async function(req, res){
  if(!req.user){
    res.status(401).end("You're not logged in");
    return;
  }
  let otherUser = req.query.otherUser;
  res.json(db.getDirectMessages(req.user._id, otherUser));
}));
