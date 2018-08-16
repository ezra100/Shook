import io = require('socket.io');
import * as https from 'https';
import {DirectMessages} from './DB/Models';
import {helpers} from './helpers';
import {DMessage} from './types';
let passportSocketIo = require('passport.socketio');

let socketIDMap: {[key: string]: string} = {};
let dmPath = '/socket.io/DMessages';


let sio: io.Server;
export function init(
    server: https.Server, cookieParser: any, sessionStore: any,
    secret: string) {
  sio = io(server, {path:dmPath});
  sio.use(passportSocketIo.authorize({
    // the same middleware you registrer in express
    key: 'connect.sid',  // the name of the cookie where express/connect stores
                         // its session_id
    secret: secret,      // the session_secret to parse the cookie
    store:
        sessionStore,  // we NEED to use a sessionstore. no memorystore please
  }));
  sio.on('connection', (socket) => {
    let user = socket.request.user;
    if (!user) {
      console.error('socket doesn\'t have user assigned to it', socket);
      return;
    }
    socketIDMap[user._id] = socket.id;
    socket.on('disconnect', () => {
      delete socketIDMap[user._id];
    });
    socket.on('dmessage', (msg: DMessage) => {
      msg.from = user._id;
      msg.date = new Date();
      DirectMessages.addDMessage(msg);
      // send back, for confirmation
      socket.emit('dmessage', msg);
      try {
        sendDMessage(<DMessage>msg);
      } catch {
      }
    })
  })
}

export function sendDMessage(msg: DMessage) {
  let sid = socketIDMap[msg.to];
  if (!sid) {
    throw msg.to + 'isn\'t connected';
  }
  sio.to(sid).emit('dmessage', msg);
}
