import * as mongoose from 'mongoose';

import {ChatRoom, Message} from '../../types';
import {chatRoomPermitedFields, Schema, stripObject} from '../helpers';

import {Users} from './users'
import { ObjectId } from 'bson';

let messageSchema = new Schema({
  date: {type: Date, default: Date.now, index: true},
  content: {type: String, required: true},
  owner: {type: String, ref: 'User', index: true},
  from: {type: String, ref: 'User', index: true},
  likes: [{type: String, required: true, ref: 'User'}],
  dislikes: [{type: String, required: true, ref: 'User'}],
  imageURL: {type: String, required: false}
});

let chatRoomSchema = new Schema({
  name: {type: String, required: true, index: true},
  admins: [{type: String, required: true, ref: 'User', index: true}],
  owner: {type: String, required: true},
  members: [{type: String, required: true, ref: 'User', index: true}],
  memberRequests: [{type: String, required: true, ref: 'User', index: true}],
  messages: [messageSchema]
});


let chatRoomModel = mongoose.model('ChatRoom', chatRoomSchema);

export namespace ChatRooms {
  export async function
  addChatRoom(room: ChatRoom, verifyAdmins: boolean = true) {
    room.members = room.members || [];
    room.admins = room.admins || [];
    room.messages = [];
    room.memberRequests = room.memberRequests || [];
    room.admins.push(room.owner);
    // remove duplicates
    room.admins = [...new Set(room.admins)];
    room.members.push(... room.admins);
    room.members = [...new Set(room.members)];
    if (verifyAdmins) {
      let adminsUsers =
          await Users.userModel.find({_id: {$in: room.admins}}).exec();
      if (adminsUsers.length !== room.admins.length) {
        let verifiedAdmins: string[] = adminsUsers.map(user => user._id);
        let missingAdmins =
            room.admins.filter(name => verifiedAdmins.indexOf(name) === -1);
        throw 'the following admins don\'t exist: ' +
            JSON.stringify(missingAdmins);
      }
    }
    let doc = await chatRoomModel.create(room);
    return doc && doc.toObject();
  }

  export async function
  updateRoom(id: number, owner: string, chatRoom: Partial<ChatRoom>) {
    chatRoom = stripObject(chatRoom, chatRoomPermitedFields);
    let doc = await chatRoomModel.findOneAndUpdate(
        {_id: id, owner: owner}, {$set: chatRoom}, {new: true});
    return doc && doc.toObject();
  }


  export async function getRooms(filter: any = {}): Promise<ChatRoom[]> {
    return await chatRoomModel.aggregate([
      {$match: filter},
      {$addFields: {lastMsg: {$arrayElemAt: ['$messages', -1]}}},
      {$sort: {'lastMsg.date': -1}}
    ]);
  }
  export async function
  getRoomByID(roomID: string, getMessages: boolean = true): Promise<ChatRoom> {
    if (!getMessages) {
      // exclude messages if not needed
      return <any>await chatRoomModel.findById(roomID, {messages: 0});
    }
    let doc: ChatRoom = <any>await chatRoomModel.findById(roomID);
    if (doc && doc.messages.length > 0)
      doc.lastMsg = doc.messages[doc.messages.length - 1];
    return doc;
  }
  export async function
  addMember(member: string, adminName: string, roomID: string) {
    if (!await Users.getUser(member)) {
      throw member + ' doesn\'t exist';
    }
    return await chatRoomModel.updateOne(
        {
          _id: roomID,
          admins:
              /* maek sure the given admin is actually an admin of that room*/
              adminName
        },
        {$addToSet: {members: member}, $pull: {memberRequests: member}});
  }
  export async function
  removeMember(member: string, requesting: string, roomID: string) {
    if (member != requesting) {
      let chatRoom = await getRoomByID(roomID, false);
      if (chatRoom.admins.indexOf(requesting) < 0) {
        throw 'You\'re not authorized to remove member';
      }
    }
    return await chatRoomModel.updateOne(
        {_id: roomID}, {$pull: {members: member}});
  }

  export async function addMemberRequest(userID: string, roomID: string) {
    return await chatRoomModel.updateOne(
        {_id: roomID}, {$addToSet: {memberRequests: userID}});
  }

  export async function
  removeMemberRequest(member: string, adminName: string, roomID: string) {
    return await chatRoomModel.updateOne(
        {_id: roomID, admins: adminName}, {$pull: {memberRequests: member}});
  }


  export async function
  addAdmin(admin: string, roomOwnerName: string, roomID: string) {
    if (!await Users.getUser(admin)) {
      throw admin + ' doesn\'t exist';
    }
    await addMember(admin, roomOwnerName, roomID);
    return await chatRoomModel.updateOne(
        {
          _id: roomID,
          owner: /* make sure the given owner name is actually the owner of
                    that room*/
              roomOwnerName
        },
        {$addToSet: {admins: admin}});
  }
  export async function
  removeAdmin(admin: string, roomOwnerName: string, roomID: string) {
    if (admin === roomOwnerName) {
      throw 'the owner cannot remove itself from the admin list';
    }
    return await chatRoomModel.updateOne(
        {_id: roomID, owner: roomOwnerName}, {$pull: {admins: admin}});
  }

  export async function getGroupsWhereUserMemberOf(username: string) {
    return await chatRoomModel.aggregate([
      {$match: {members: username}},
      {$addFields: {lastMsg: {$arrayElemAt: ['$messages', -1]}}},
      {$sort: {'lastMsg.date': -1}}
    ]);
  }
  export async function getGroupsWhereUserIsAdmin(username: string) {
    return await chatRoomModel.aggregate([
      {$match: {admins: username}},
      {$addFields: {lastMsg: {$arrayElemAt: ['$messages', -1]}}},
      {$sort: {'lastMsg.date': -1}}
    ]);
  }
  export async function getGroupsUserOwns(username: string) {
    return await chatRoomModel.aggregate([
      {$match: {owner: username}},
      {$addFields: {lastMsg: {$arrayElemAt: ['$messages', -1]}}},
      {$sort: {'lastMsg.date': -1}}
    ]);
  }

  export async function
  addMessage(message: Message, verifyMember: boolean = true): Promise<Message> {
    delete message._id;
    if (verifyMember) {
      let chat = await chatRoomModel.find(
          {_id: message.roomID, members: message.from});
      if (!chat) {
        throw message.from + ' is not a member of this room';
      }
    }
    let queryResults = await chatRoomModel.updateOne(
        {_id: message.roomID}, {$push: {messages: message}});
    return queryResults;
  }
  export async function deleteMessage(msg: Message, requesting: string) {
    let roomDoc =
        <mongoose.Document&ChatRoom>await chatRoomModel.findOne({_id: msg._id});
    if (!roomDoc) {
      throw msg.roomID + ': room id doesn\'t exist';
    }
    let msgDoc = roomDoc.messages.find(m => m._id === msg._id);
    if (!msgDoc) {
      throw `Message with id ${msg._id} doesn't exists in room ${msg.roomID}`;
    }
    if (msgDoc.from === requesting ||
        roomDoc.admins.find(uID => uID === msg.from)) {
      return await chatRoomModel.update(
          {_id: roomDoc._id}, {$pull: {_id: msg._id}});
    } else {
      throw 'You\'re not authorized to delete this message';
    }
  }

  export async function likeMsg(roomID: string, msgID: string, userID: string) {
    return await chatRoomModel.updateOne(
        {_id: roomID}, {
          $addToSet: {'messages.$[element].likes': userID},
          $pull: {'messages.$[element].dislikes': userID}
        },
        {
          arrayFilters: [{
            'element._id': new ObjectId( msgID) /*I hope mongoose converts this to ObjectID,
                                    otherwise we'll have to do it*/
          }]
        });
  }
  export async function
  dislikeMsg(roomID: string, msgID: string, userID: string) {
    return await chatRoomModel.updateOne(
        {_id: roomID}, {
          $pull: {'messages.$[element].likes': userID},
          $addToSet: {'messages.$[element].dislikes': userID}
        },
        {arrayFilters: [{'element._id': new ObjectId( msgID)}]});
  }
  export async function
  removeLikeDislike(roomID: string, msgID: string, userID: string) {
    return await chatRoomModel.updateOne(
        {_id: roomID}, {
          $pull: {
            'messages.$[element].likes': userID,
            'messages.$[element].dislikes': userID
          }
        },
        {arrayFilters: [{'element._id': new ObjectId( msgID)}]});
  }
  export async function getIDs() {
    return await chatRoomModel.find().select('_id');
  }
  export async function getCount() {
    return await chatRoomModel.estimatedDocumentCount().exec();
  }
}