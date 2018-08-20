import * as passportMod from 'passport';
import * as GAuth from 'passport-google-oauth';
import {Strategy} from 'passport-local';

import {UserAuth, Users} from '../DB/Models';
import {User} from '../types'

import {sha512} from './crypto';
import {client_secret, client_id} from '../google-auth';

export let tempSalts: {[username: string]: string} = {};
let GoogleStrategy = GAuth.OAuth2Strategy;

passportMod.use(new GoogleStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: '/auth/google/verify'
    },
    function(token, tokenSecret, profile, done) {
      console.log(token, tokenSecret, profile);
      return done(null, null);
    }));

passportMod.use(new Strategy(async function(username, password, cb) {
  let userAuthData = await UserAuth.getUserAuthData(username);
  try {
    if (userAuthData) {
      let hashedPassword =
          sha512(userAuthData.hashedPassword, tempSalts[username]);
      if (hashedPassword === password) {
        let user = await Users.getUser(username, true);
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
  Users.getUser(username, true).then((user) => cb(null, <User>user));
});

export var passport: passportMod.PassportStatic = passportMod;
