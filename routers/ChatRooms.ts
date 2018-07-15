import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {ChatRoom, Message, User} from '../types';

export var router = express.Router();

router.post('/createRoom', helpers.asyncWrapper(async function(req, res) {
  let name = req.body.name;
  let owner = req.user._id;
  let admins = req.body.admins || [];
  return res.json(db.addChatRoom(name, owner, admins));
}));

router.put('/renameRoom', helpers.asyncWrapper(async function(req, res) {
  let newName = req.body.name;
  let chatID = req.body._id || req.body.id;
  return res.json(db.updateRoom(chatID, req.user._id, {name: newName}));
}));

router.post('/addMessage', helpers.asyncWrapper(async function(req, res) {
    
  let content = req.body.content;
  let roomID = req.body.roomID;
  let message: Message = {content, owner: req.user._id, roomID: roomID};
  return res.json(db.addMessage(message));
}));
router.get("/getMessages")