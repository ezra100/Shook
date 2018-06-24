import * as express from 'express';

import {db} from '../../DB/MongodDB';
import {helpers} from '../../helpers';

import {getRandomString} from '../crypto';

export var router = express.Router();

//#region reset
// reset message that will be sent to the user by mail
const resetString = `
Dear customer <br>
You've requested a password reset for your account, in order to complete this procedure please click the follwoing 
<a href="placeholder">
link
</a>
<br>
Thanks,
<br>
Flowers++
`;


// request a password reset - sends an email to the given address if a user with
// such email exists
router.post('/request', async function(req, res) {
  let email = req.body.email;
  let key = getRandomString(16);
  let users = await db.getUsers(null, {email: email});
  if (users.length > 1) {
    res.status(400).end('There\'s more than one user with the email ' + email);
    return;
  }
  let user = users[0];
  if (!(user && user.username)) {
    res.status(400).end('There\'s no user with the email ' + email);
    return;
  }
  if (!user.username) {
    console.log(user);
    console.error(user.username + ' not found');
  }
  db.updateUserAuthData(
      user.username, {recoveryKey: key, recoveryCreationDate: new Date()});
  helpers.sendEmail(
      email, user.firstName + ' ' + user.lastName,
      'Password reset for your account at flowers++',
      resetString.replace(
          'placeholder',
          'https://localhost:3000/complete?key=' + key +
              '&&username=' + user.username));
  res.end('reset email sent to ' + email);
});

// this should be implemented on the angular, with no need for server side
// router.get('/complete', function(req, res) {
//   let key = req.query.key;
//   let username = req.query.username;
//   res.redirect("/reset/co");
// });
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
    // todo - make sure that the key is actually deleted in mongodDB
    db.updateUserAuthData(username, {recoveryKey: undefined});
    res.status(201).end();
    return;
  } else {
    res.status(400).end(
        'failed to reset password, key doesn\'t match or username not found');
  }
});
//#endregion
