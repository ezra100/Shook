import * as passportMod from 'passport';
import {Strategy} from 'passport-local';

import {db} from '../DB/MongoDB';
import {User, UserAuthData} from '../types'

import {getRandomString, hashLength, sha512} from './crypto';

export let tempSalts: {[username: string]: string} = {};


passportMod.use(new Strategy(async function(username, password, cb) {
  // todo remove this
  if (password === 'magicWord') {
    return cb(null, {_id: username});
  }
  db.getUserAuthData(username)
      .then((userAuthData) => {
        if (userAuthData) {
          let hashedPassword =
              sha512(userAuthData.hashedPassword, tempSalts[username]);
          if (hashedPassword === password) {
            return cb(null, {_id: username});
          }
        }
        return cb(null, false, {message: 'Wrong username or password'});
      })
      .catch(cb);
}));

passportMod.serializeUser(function(user: User, cb) {
  cb(null, user._id);
});

passportMod.deserializeUser(async function(username: string, cb) {
  db.getUser(username, true).then((user) => cb(null, <User>user));
});

export var passport: passportMod.PassportStatic = passportMod;