import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {UserAuthData} from '../types';

import {getRandomString, hashLength, sha512} from './crypto';
import {passport, tempSalts} from './passport';
import * as reset from './reset/reset';

export var router = express.Router();

router.use('/reset', reset.router);



router.put(
    '/login', passport.authenticate('local'),
    function(req, res) {
      if (req.user) {
        res.status(201).json(req.user);
        return;
      }
      res.status(400).end('Wrong username or password');
    });
router.put('/logout', function(req: express.Request, res) {
  req.logout();
  res.end('You\'ve logged out successfully');
});

// requests the salts for the challengs
router.post('/salts', helpers.asyncWrapper(async function(req, res) {
  let username = req.body.username;
  let userData = await db.getUserAuthData(username);
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
  await db.createUserAuthData(userAuthData);
}