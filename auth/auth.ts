import * as express from 'express';
import * as googleAuth from 'google-auth-library';

import {UserAuth, Users} from '../DB/Models';
import {client_id} from '../google-auth';
import {helpers} from '../helpers';
import {UserAuthData} from '../types';

import {getRandomString, hashLength, sha512} from './crypto';
import {passport, tempSalts} from './passport';
import * as reset from './reset/reset';


export var router = express.Router();

const googleAuthClient = new googleAuth.OAuth2Client(client_id);


router.use('/reset', reset.router);

router.get('/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login']
}));

router.get(
    '/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function(req, res) {
      res.redirect('/');
    });

router.put('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).end(info.message);
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.json(user);
    });
  })(req, res, next);
});
router.put('/logout', function(req: express.Request, res) {
  req.logout();
  res.end('You\'ve logged out successfully');
});

// requests the salts for the challengs
router.post('/salts', helpers.asyncWrapper(async function(req, res) {
  let username = req.body.username;
  let userData = await UserAuth.getUserAuthData(username);
  if (!userData) {
    // throw username + ' not found';
    res.json({
      tempSalt: getRandomString(hashLength),
      permSalt: getRandomString(hashLength),
    });
  }
  tempSalts[username] = getRandomString(hashLength);
  res.json({tempSalt: tempSalts[username], permSalt: (userData).salt});
}));

//------------------------------------------------------------

export async function createUserData(username: string, password: string) {
  let salt = getRandomString();
  let hash = sha512(password, salt);
  let userAuthData: UserAuthData = {salt, _id: username, hashedPassword: hash};
  await UserAuth.createUserAuthData(userAuthData);
}



async function verify(token: string) {}

router.put('/verify', helpers.asyncWrapper(async function(req, res) {
  let token = req.body.token;
  const ticket = await googleAuthClient.verifyIdToken(
      {idToken: token, audience: client_id});
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  console.log(userid);
  let user = await Users.findUserByEmail(payload.email);
  if (user) {
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).end();
      }
      return res.json(user);
    });

  } else {
    res.status(400).end('user with the given email doesn\'t exist');
  }
}));