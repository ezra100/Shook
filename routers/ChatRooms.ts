import * as express from 'express';

import * as db from '../DB/Models';
import {helpers} from '../helpers';
import {ChatRoom, Message, User} from '../types';
import { Router } from 'express-serve-static-core';

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
router.get('/getByID', helpers.asyncWrapper(async function(req, res){
  let roomID = req.query.roomID;
  return res.json(await db.ChatRooms.getRoomByID(roomID));
}))

router.put('/addAdmin',  helpers.asyncWrapper(async function(req, res) {
  let adminID = req.body.adminID;
  let roomID = req.body.roomID;
  return res.json(await
      db.ChatRooms.addAdmin(adminID, req.user._id, roomID));
}));
router.put('/removeAdmin',  helpers.asyncWrapper(async function(req, res) {
  let adminID = req.body.adminID;
  let roomID = req.body.roomID;
  return res.json(await
      db.ChatRooms.removeAdmin(adminID, req.user._id, roomID));
}));

router.get('/groupsImMemberOf', helpers.asyncWrapper(async function(req, res){
    return res.json(await db.ChatRooms.getGroupsWhereUserMemberOf(req.user._id));
}));
router.get('/groupsImAdminOf', helpers.asyncWrapper(async function(req, res){
  return res.json(await db.ChatRooms.getGroupsWhereUserIsAdmin(req.user._id));
}));
router.get('/groupsICreated', helpers.asyncWrapper(async function(req, res){
  return res.json(await db.ChatRooms.getGroupsUserOwns(req.user._id));
}))



// todo add socket.io
router.post('/addMessage', helpers.asyncWrapper(async function(req, res) {
  let content = req.body.content;
  let roomID = req.body.roomID;
  let message: Message = {content, from: req.user._id, roomID: roomID};
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