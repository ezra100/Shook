import * as express from 'express';

import {db} from '../DB/MongoDB';
import {UserAuthData} from '../types';

import {getRandomString, hashLength, sha512} from './crypto';
import {passport, tempSalts} from './passport';
import * as reset from './reset/reset';
import { helpers } from '../helpers';

export var router = express.Router();

router.use('/reset', reset.router);



router.post(
    '/login',
    passport.authenticate(
        'local', {failureMessage: 'wrong username or password'}),
    function(req, res) {
      if (req.user) {
        res.status(201).end("login successful");
        return;
      }
      res.status(400).end('Wrong username or password');
    });
router.post('/logout', function(req: express.Request, res) {
  req.logout();
  res.end("You've logged successfully");
});

// requests the salts for the challengs
router.post('/salts', helpers.asyncWrapper(async function(req, res) {
  let username = req.body.username;
  tempSalts[username] = getRandomString(hashLength);
  res.json({
    tempSalt: tempSalts[username],
    permSalt: (await db.getUserAuthData(username)).salt
  });
}));

//------------------------------------------------------------

export async function createUserData(username: string, password: string) {
  let salt = getRandomString();
  let hash = sha512(password, salt);
  let userAuthData: UserAuthData = {salt, _id: username, hashedPassword: hash};
  await db.createUserAuthData(userAuthData);
}