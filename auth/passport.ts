import * as passportMod from 'passport';
import {Strategy} from 'passport-local';

import {getRandomString, hashLength, sha512} from './crypto';
import {db} from '../DB/MongoDB';
import {User, UserAuthData} from '../types'

export let tempSalts: {[username: string]: string} = {};


passportMod.use(new Strategy(async function(username, password, cb) {
  db.getUserAuthData(username).catch(cb).then((userAuthData) => {
    if (userAuthData) {
      let hashedPassword =
          sha512(userAuthData.hashedPassword, tempSalts[username]);
      if (hashedPassword === password) {
        return cb(null, userAuthData);
      }
    }
    return cb(null, false, {message: 'Wrong username or password'});
  });
}));

passportMod.serializeUser(function(user: User, cb) {
  cb(null, user.username);
});

passportMod.deserializeUser(async function(username: string, cb) {
  db.getUser(username).catch(cb).then((user) => cb(null, <User>user));
});

export var passport: passportMod.PassportStatic = passportMod;