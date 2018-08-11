import io = require('socket.io');
import * as https from 'https';
import {db} from './DB/MongoDB';
import {helpers} from './helpers';
import {DMessage} from './types';
import {message} from '*.json';
let passportSocketIo = require('passport.socketio');

let socketIDMap: {[key: string]: string} = {};

function onAuthorizeSuccess(data: any, accept: Function) {
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);
}

function onAuthorizeFail(
    data: any, message: string, error: any, accept: Function) {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.
  accept(null, false);

  // OR

  // If you use socket.io@1.X the callback looks different
  // If you don't want to accept the connection
  if (error) accept(new Error(message));
  // this error will be sent to the user as a special error-package
  // see: http://socket.io/docs/client-api/#socket > error-object
}
let sio: io.Server;
export function init(
    server: https.Server, cookieParser: any, sessionStore: any,
    secret: string) {
  sio = io(server);
  sio.use(passportSocketIo.authorize({
    cookieParser: cookieParser,  // the same middleware you registrer in express
    key: 'connect.sid',  // the name of the cookie where express/connect stores
                         // its session_id
    secret: secret,      // the session_secret to parse the cookie
    store:
        sessionStore,  // we NEED to use a sessionstore. no memorystore please
    success:
        onAuthorizeSuccess,  // *optional* callback on success - read more below
    fail: onAuthorizeFail
  }));
  sio.on('connection', (socket) => {
    let user = socket.request.user;
    if (!user) {
      console.error('socket doesn\'t have user assigned to it', socket);
      return;
    }
    socketIDMap[user] = socket.id;
    socket.on('diconnect', () => {
      delete socketIDMap[user];
    });
    socket.on('dmessage', (msg: DMessage) => {
      msg.from = user;
      msg.date = new Date();
      db.DirectMessages.addDMessage(msg);
      try {
        sendDMessage(<DMessage>msg);
      } finally {
      }
    })
  })
}

export function sendDMessage(msg: DMessage) {
  let sid = socketIDMap[msg.to];
  if (!sid) {
    throw msg.to + 'isn\'t connected';
  }
  sio.to(sid).emit('dmessage', message);
}
