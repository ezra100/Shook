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
  let message: DMessage = {from: req.user._id, to, content, date: new Date()};
  res.json(await db.DirectMessages.addDMessage(message));
}));

router.get('/getMessages', helpers.asyncWrapper(async function(req, res) {
  if (!req.user) {
    res.status(401).end('You\'re not logged in');
    return;
  }
  let otherUser = req.query.otherUser;
  res.json(await db.DirectMessages.getDirectMessages(req.user._id, otherUser));
}));

router.get('/getRecent', helpers.asyncWrapper(async function(req, res) {
  if (!req.user) {
    res.status(401).end('You\'re not logged in');
    return;
  }
  let limit = Number(req.query.limit) || 20;
  let offset = Number(req.query.offset) || 0;
  res.json(await db.DirectMessages.getLastChats(req.user._id, offset, limit));
}));