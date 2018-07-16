import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {ChatRoom, Message, User} from '../types';

export var router = express.Router();

router.post('/createRoom', helpers.asyncWrapper(async function(req, res) {
  let name = req.body.name;
  let owner = req.user._id;
  let admins = req.body.admins || [];
  return res.json(db.ChatRooms.addChatRoom(name, owner, admins));
}));

router.put('/renameRoom', helpers.asyncWrapper(async function(req, res) {
  let newName = req.body.name;
  let roomID = req.body.roomID;
  return res.json(
      db.ChatRooms.updateRoom(roomID, req.user._id, {name: newName}));
}));

router.post('/addMessage', helpers.asyncWrapper(async function(req, res) {
  let content = req.body.content;
  let roomID = req.body.roomID;
  let message: Message = {content, owner: req.user._id, roomID: roomID};
  return res.json(db.ChatRooms.addMessage(message));
}));
router.get('/getMessages', helpers.asyncWrapper(async function(req, res) {
  let roomID = req.body.roomID;
  let limit = Number(req.body.limit || 150);
  let offset = Number(req.body.offset || 0);
  return res.json(db.ChatRooms.getMessagesFromRoom(roomID, limit, offset));
}))