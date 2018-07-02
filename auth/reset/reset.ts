import * as express from 'express';
import {message} from '../../data.json';
import {db} from '../../DB/MongoDB';
import {helpers} from '../../helpers';
import {User} from '../../types';
import {getRandomString, hashLength, sha512} from '../crypto';

export var router = express.Router();


// request a password reset - sends an email to the given address if a user with
// such email exists
router.post('/request', async function(req, res) {
  let user: User;
  // the user can send an email or a username to reset
  if (req.body.email) {
    user = await db.findUserByEmail(req.body.email);
  } else if (req.body.username) {
    user = await db.getUser(req.body.username);
  }
  if (!user) {
    res.status(400).end('user not found');
    return;
  }
  let key = getRandomString(16);

  if (!user._id) {
    console.log(user);
    console.error(user._id + ' not found');
  }
  db.updateUserAuthData(
      user._id, {recoveryKey: key, recoveryCreationDate: new Date()});
  helpers.sendEmail(
      user.email, user.firstName + ' ' + user.lastName,
      'Password reset for your account at flowers++',
      message.replace(
          'placeholder',
          'https://localhost:3000/complete?key=' + key +
              '&&username=' + user._id));
  // don't show the email unless the user sent it
  res.status(201).end('reset email sent to' + (req.body.email || 'your email'));
});


// the target of the reset form - here the  password is replaced with the new
// one
router.post('/complete', async function(req, res) {
  let key = req.body.key;
  let username = req.body.username;
  let newPassword = req.body.password;
  let userData = await db.getUserAuthData(username);
  if (newPassword && userData && userData.recoveryKey === key) {
    // if more than 24 hours past since the creation
    if ((new Date()).getTime() - userData.recoveryCreationDate.getTime() >=
        (1000 * 3600 * 24)) {
      res.status(400).end('Can\'t reset after more than 24 hours');
      return;
    }
    // deletes the key
    // todo - make sure that the key is actually deleted in MongoDB

    // new salt, because why not
    let newSalt = getRandomString(hashLength);
    let newPasswordHash = sha512(newPassword, newSalt);
    db.updateUserAuthData(username, {
      recoveryKey: undefined,  // prevent reuse of the recovery key
      hashedPassword: newPasswordHash,
      salt: newSalt
    });
    res.status(201).end("reset complete");
    return;
  } else {
    res.status(400).end(
        'failed to reset password, key doesn\'t match or username not found');
  }
});
