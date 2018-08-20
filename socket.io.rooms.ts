import io = require('socket.io');
import * as https from 'https';
import {ChatRooms} from './DB/Models';
import escapeHtml = require('escape-html');

import {ChatRoom, Message, User, Action, SIORoomUpdate} from './types';
let passportSocketIo = require('passport.socketio');
import {Types} from 'mongoose';
import { ObjectId } from 'mongodb';
type ObjectId = Types.ObjectId;

let socketIDMap: {[key: string]: string} = {};
let roomsPath = '/socket.io/rooms';

let roomsCache: {[key: string]: ChatRoom} = {};

async function getRoomFromCache(roomID: string) {
  if (!roomsCache[roomID]) {
    roomsCache[roomID] = await ChatRooms.getRoomByID(roomID, false);
    roomsCache[roomID].connected = 0;
  }
  return roomsCache[roomID];
}
async function increaseConnectedCount(roomID: string) {
  let chatRoom = await getRoomFromCache(roomID);
  chatRoom.connected++;
  return chatRoom;
}
async function decreaseConnectedCount(roomID: string) {
  let chatRoom = await getRoomFromCache(roomID);
  chatRoom.connected--;
  if (chatRoom.connected < 1) {
    delete roomsCache[roomID];
  }
  return chatRoom;
}

let sio: io.Server;
export function init(server: https.Server, sessionStore: any, secret: string) {
  sio = io(server, {path: roomsPath});
  sio.use(passportSocketIo.authorize({
    // the same middleware you registrer in express
    key: 'connect.sid',  // the name of the cookie where express/connect stores
                         // its session_id
    secret: secret,      // the session_secret to parse the cookie
    store:
        sessionStore,  // we NEED to use a sessionstore. no memorystore please
  }));
  sio.on('connection', (socket) => {
    let user: User = socket.request.user;
    console.log('socket connected', socket.id, user._id);
    if (!user) {
      console.error('socket doesn\'t have user assigned to it', socket);
      return;
    }
    socketIDMap[socket.id] = user._id;
    socket.on(
        'disconnect',
        () => {console.log(
            'socket disconnected', socket.id, socket.rooms, user._id)});
    socket.on(
        'disconnecting',
        () => {Object.keys(socket.rooms)
                   .forEach(
                       room => room.length === 24 &&
                           decreaseConnectedCount(room))});
    socket.on('join', async (roomIDs: string|string[]) => {
      if (typeof roomIDs === 'string') {
        roomIDs = [roomIDs];
      }
      roomIDs.forEach(async (roomID, i, arr) => {
        let room = await increaseConnectedCount(roomID);
        if (!room) {
          arr.splice(i, 1);
          socket.emit('error', `room with room id ${roomID} doesn't exist`);
          return;
        }
      });
      socket.join(roomIDs, (err) => console.log(err));
      socket.emit('joined', roomIDs);
    });
    socket.on('leave', async (roomID: string) => {
      let room = await decreaseConnectedCount(roomID);
      if (!room) {
        socket.emit('error', `room with room id ${roomID} doesn't exist`);
        return;
      }
      socket.leave(roomID);
      socket.emit('left', room);
    });
    socket.on('msg', async (msg: Message) => {
      console.log(`msg from ${user._id}`);
      msg.date = new Date();
      msg.from = user._id;
      msg._id = new ObjectId().toHexString();
      msg.likes = msg.dislikes = [];
      msg.content = escapeHtml(msg.content);
      let room = await getRoomFromCache(msg.roomID);
      if (!room) {
        throw `${msg.roomID} doesn't exists`;
      }
      if (room.members.find(uID => uID === user._id)) {
        sio.to(msg.roomID).emit('msg', msg);
      }
      if (msg.saveToDb) {
        await ChatRooms.addMessage(msg);
      }
    });
  })
}
// send an update about event to a room
export function updateRoom(roomID: string, eventName: string, msg: any) {
  sio.to(roomID).emit(eventName, msg);
}
// sends a msg to all sockets of a room to update the properties of a room.
// (i.e. an array field)
export function updateRoomArr(update: SIORoomUpdate) {
  sio.to(update.roomID).emit('room-update', update);
}
