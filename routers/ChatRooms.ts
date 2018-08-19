import * as express from 'express';

import * as db from '../DB/Models';
import {helpers} from '../helpers';
import upload from '../multer';
import {updateRoom, updateRoomArr} from '../socket.io.rooms';
import {Action, ChatRoom, LikeType, LikeUpdate, Message, User} from '../types';

export var router = express.Router();


router.post('/createRoom', helpers.asyncWrapper(async function(req, res) {
  let name = req.body.name;
  let owner = req.user._id;
  let admins = req.body.admins || [];
  return res.json(
      await db.ChatRooms.addChatRoom({name, owner, admins, messages: []}));
}));

router.put('/renameRoom', helpers.asyncWrapper(async function(req, res) {
  let newName = req.body.name;
  let roomID = req.body.roomID;
  return res.json(
      await db.ChatRooms.updateRoom(roomID, req.user._id, {name: newName}));
}));
router.get('/getByID', helpers.asyncWrapper(async function(req, res) {
  let roomID = req.query.roomID;
  return res.json(await db.ChatRooms.getRoomByID(roomID));
}))

router.put('/addAdmin', helpers.asyncWrapper(async function(req, res) {
  let adminID = req.body.adminID;
  let roomID = req.body.roomID;
  let results = await db.ChatRooms.addAdmin(adminID, req.user._id, roomID);
  updateRoomArr({action: Action.Add, roomID, field: 'admins', value: adminID});

  return res.json(results);
}));
router.put('/removeAdmin', helpers.asyncWrapper(async function(req, res) {
  let adminID = req.body.adminID;
  let roomID = req.body.roomID;
  let results = await db.ChatRooms.removeAdmin(adminID, req.user._id, roomID);
  updateRoomArr(
      {action: Action.Remove, roomID, field: 'admins', value: adminID});
  return res.json(results);
}));

router.get('/groupsImMemberOf', helpers.asyncWrapper(async function(req, res) {
  return res.json(await db.ChatRooms.getGroupsWhereUserMemberOf(req.user._id));
}));
router.get('/groupsImAdminOf', helpers.asyncWrapper(async function(req, res) {
  return res.json(await db.ChatRooms.getGroupsWhereUserIsAdmin(req.user._id));
}));
router.get('/groupsICreated', helpers.asyncWrapper(async function(req, res) {
  return res.json(await db.ChatRooms.getGroupsUserOwns(req.user._id));
}))

router.get('/getRooms', helpers.asyncWrapper(async function(req, res) {
  let filter: any = {};
  if (req.query.name) {
    filter.name = {$regex: helpers.escapeRegExp(req.query.name), $options: 'i'};
  }
  if (req.query.members) {
    filter.members = {
      $regex: helpers.escapeRegExp(req.query.members),
      $options: 'i'
    };
  }
  if (req.query.messages) {
    filter.messages = {
      content:
          {$regex: helpers.escapeRegExp(req.query.messages), $options: 'i'}
    };
  }
  return res.json(await db.ChatRooms.getRooms(filter));
}));



// todo add socket.io
router.post('/addMessage', helpers.asyncWrapper(async function(req, res) {
  let content = req.body.content;
  let roomID = req.body.roomID;
  let message: Message = {content, from: req.user._id, roomID: roomID};
  return res.json(await db.ChatRooms.addMessage(message));
}));

router.delete('/deleteMessage', helpers.asyncWrapper(async function(req, res) {
  if (!req.user._id) {
    throw 'You\'re not logged in';
  }
  let messageID = req.query.id || req.query._id;
  res.json(await db.ChatRooms.deleteMessage(messageID, req.query._id));
}));

router.put(
    '/removeMemberRequest', helpers.asyncWrapper(async function(req, res) {
      let member = req.body.member;
      let roomID = req.body.roomID;
      let results =
          await db.ChatRooms.removeMemberRequest(member, req.user._id, roomID);
      updateRoomArr({
        action: Action.Remove,
        roomID,
        field: 'memberRequests',
        value: member
      });
      return res.json(results);
    }))

router.put('/addMember', helpers.asyncWrapper(async function(req, res) {
  let member = req.body.member;
  let roomID = req.body.roomID;
  let results = await db.ChatRooms.addMember(member, req.user._id, roomID);
  // todo make sure the member request was really authoried
  updateRoomArr(
      {action: Action.Remove, roomID, field: 'memberRequests', value: member});
  updateRoomArr({action: Action.Add, roomID, field: 'members', value: member});
  return res.json(results);
}));
router.put('/removeMember', helpers.asyncWrapper(async function(req, res) {
  let member = req.body.memberID;
  let roomID = req.body.roomID;
  let results = await db.ChatRooms.removeMember(member, req.user._id, roomID);
  // todo make sure the member request was really authoried
  updateRoomArr(
      {action: Action.Remove, roomID, field: 'members', value: member});
  return res.json(results);
}));

router.put('/requestMembership', helpers.asyncWrapper(async function(req, res) {
  if (!req.user) {
    throw 'You\'re not logged in';
  }
  let roomID = req.body.roomID;
  let results = await db.ChatRooms.addMemberRequest(req.user._id, roomID);
  updateRoomArr({
    action: Action.Add,
    roomID: roomID,
    field: 'memberRequests',
    value: req.user._id
  });
  return res.json(results);
}));

router.put('/likeMsg', helpers.asyncWrapper(async function(req, res) {
  if (!req.user) {
    throw 'You\'re not logged in';
  }
  let roomID = req.body.roomID;
  let messageID = req.body.messageID;
  let results = await db.ChatRooms.likeMsg(roomID, messageID, req.user._id);
  updateRoom(roomID, 'likes-update', <LikeUpdate>{
    action: LikeType.Like,
    msgID: messageID,
    roomID,
    userID: req.user._id
  });
  return res.json(results);
}));
router.put('/dislikeMsg', helpers.asyncWrapper(async function(req, res) {
  if (!req.user) {
    throw 'You\'re not logged in';
  }
  let roomID = req.body.roomID;
  let messageID = req.body.messageID;
  let results = await db.ChatRooms.dislikeMsg(roomID, messageID, req.user._id);
  updateRoom(roomID, 'likes-update', <LikeUpdate>{
    action: LikeType.Disike,
    msgID: messageID,
    roomID,
    userID: req.user._id
  });
  return res.json(results);
}));
router.put('/removeLikeDislike', helpers.asyncWrapper(async function(req, res) {
  if (!req.user) {
    throw 'You\'re not logged in';
  }
  let roomID = req.body.roomID;
  let messageID = req.body.messageID;
  let results = await db.ChatRooms.dislikeMsg(roomID, messageID, req.user._id);
  updateRoom(roomID, 'likes-update', <LikeUpdate>{
    action: LikeType.Neither,
    msgID: messageID,
    roomID,
    userID: req.user._id
  });
  return res.json(results);
}));

router.post('/getImgURL', (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(400).end('you must be logged in to upload a file');
  }
}, upload.any(), helpers.asyncWrapper(async function(req, res) {
  let files = <Express.Multer.File[]>req.files;
  if (files && files[0]) {
    res.status(201).json('/pub/img/' + files[0].filename);
  }
  res.status(500).end('file not found');
}))