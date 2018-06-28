import * as express from 'express';

import {db} from '../DB/MongoDB';
import {UserAuthData} from '../types';

import {getRandomString, hashLength, sha512} from './crypto';
import {passport, tempSalts} from './passport';
import * as reset from './reset/reset';

export var router = express.Router();

router.use('/reset', reset.router);


let userProperties: string[] = [
  'address', 'username', 'firstName', 'lastName', 'email', 'gender', 'className'
];



router.post(
    '/login',
    passport.authenticate(
        'local', {failureMessage: 'wrong username or password'}),
    function(req, res) {
      if (req.user) {
        res.status(201).json({userType: req.user.className});
        return;
      }
      res.status(400).end('Wrong username or password');
    });
router.post('/logout', function(req: express.Request, res) {
  req.logout();
  res.end();
});

// requests the salts for the challengs
router.post('/salts', async function(req, res) {
  let username = req.body.username;
  tempSalts[username] = getRandomString(hashLength);
  res.json({
    tempSalt: tempSalts[username],
    permSalt: (await db.getUserAuthData(username)).salt
  });
});

//------------------------------------------------------------

export function createUserData(username: string, password: string) {
  let salt = getRandomString();
  let hash = sha512(password, salt);
  let userAuthData: UserAuthData = {salt, username, hashedPassword: hash};
  db.createUserAuthData(userAuthData);
}