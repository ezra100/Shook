import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {ChatRoom, Message, User} from '../types';

export var router = express.Router();


router.post('/createRoom', helpers.asyncWrapper(async function(req, res) {
  let name = req.body.name;
  let owner = req.user._id;
  let admins = req.body.admins || [];
  return res.json(await db.ChatRooms.addChatRoom(name, owner, admins));
}));

router.put('/renameRoom', helpers.asyncWrapper(async function(req, res) {
  let newName = req.body.name;
  let roomID = req.body.roomID;
  return res.json(await
      db.ChatRooms.updateRoom(roomID, req.user._id, {name: newName}));
}));

// todo add socket.io
router.post('/addMessage', helpers.asyncWrapper(async function(req, res) {
  let content = req.body.content;
  let roomID = req.body.roomID;
  let message: Message = {content, owner: req.user._id, roomID: roomID};
  return res.json(await db.ChatRooms.addMessage(message));
}));
router.get('/getMessages', helpers.asyncWrapper(async function(req, res) {
  let roomID = req.body.roomID;
  let limit = Number(req.body.limit || 150);
  let offset = Number(req.body.offset || 0);
  return res.json(await db.ChatRooms.getMessagesFromRoom(roomID, limit, offset));
}));

router.delete('/deleteMessage', helpers.asyncWrapper(async function(req, res){
  if(!req.user._id){
    throw "You're not logged in";
  }
  let messageID = req.query.id || req.query._id;
  res.json(await db.ChatRooms.deleteMessage(messageID, req.query._id));
}));