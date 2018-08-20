import * as express from 'express';
import {message, msgHeader} from '../../data';
import {UserAuth, Users} from '../../DB/Models';
import {helpers} from '../../helpers';
import {User} from '../../types';
import {getRandomString, hashLength, sha512} from '../crypto';

export var router = express.Router();


// request a password reset - sends an email to the given address if a user with
// such email exists
router.post('/request', helpers.asyncWrapper(async function(req, res) {
  let user:  User;
  // the user can send an email or a username to reset
  if (req.body.email) {
    user = await Users.findUserByEmail(req.body.email);
  } else if (req.body.username) {
    user = <User> await Users.getUser(req.body.username, true);
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
  UserAuth.updateUserAuthData(
      user._id, {recoveryKey: key, recoverydate: new Date()});
  helpers.sendEmail(  
      user.email, user.firstName + ' ' + user.lastName,
        msgHeader,
      message.replace(
          'placeholder',
          'https://localhost:3000/auth/completeReset?key=' + key +
              '&&userID=' + user._id));
  // don't show the email unless the user sent it
  res.status(201).json('reset email sent to ' + (req.body.email || ' your email'));
}));


// the target of the reset form - here the  password is replaced with the new
// one
router.post('/complete', helpers.asyncWrapper(async function(req, res) {
  let key = req.body.key;
  let username = req.body.username;
  let newPassword = req.body.newPassword;
  let userData = await UserAuth.getUserAuthData(username);
  if (newPassword && userData && userData.recoveryKey === key) {
    // if more than 24 hours past since the creation
    if ((new Date()).getTime() - userData.recoverydate.getTime() >=
        (1000 * 3600 * 24)) {
      res.status(400).end('Can\'t reset after more than 24 hours');
      return;
    }
    // deletes the key
    // todo - make sure that the key is actually deleted in MongoDB

    // new salt, because why not
    let newSalt = getRandomString(hashLength);
    let newPasswordHash = sha512(newPassword, newSalt);
    UserAuth.updateUserAuthData(username, {
      recoveryKey: undefined,  // prevent reuse of the recovery key
      hashedPassword: newPasswordHash,
      salt: newSalt
    });
    res.status(201).json("reset complete");
    return;
  } else {
    res.status(400).end(
        'failed to reset password, key doesn\'t match or username not found');
  }
}));
