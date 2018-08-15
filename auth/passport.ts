import * as passportMod from 'passport';
import {Strategy} from 'passport-local';

import {db} from '../DB/MongoDB';
import {User, UserAuthData} from '../types'

import {getRandomString, hashLength, sha512} from './crypto';

export let tempSalts: {[username: string]: string} = {};


passportMod.use(new Strategy(async function(username, password, cb) {
  let userAuthData = await db.getUserAuthData(username);
  try {
    if (userAuthData) {
      let hashedPassword =
          sha512(userAuthData.hashedPassword, tempSalts[username]);
      if (hashedPassword === password) {
        let user = await db.getUser(username, true);
        if (!user.isAuthorized) {
          return cb(null, false, {message: 'user not authorized yet'});
        }
        return cb(null, user);
      }
    }
    return cb(null, false, {message: 'Wrong username or password'});
  } catch (err) {
    console.log(err);
  }
  return cb(null, false, {message: 'Something went wrong'});
}));

passportMod.serializeUser(function(user: User, cb) {
  cb(null, user._id);
});

passportMod.deserializeUser(async function(username: string, cb) {
  db.getUser(username, true).then((user) => cb(null, <User>user));
});

export var passport: passportMod.PassportStatic = passportMod;