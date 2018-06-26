import * as express from 'express';

import {createUserData} from '../auth/auth';
import {db} from '../DB/MongodDB';
import {User} from '../types';

export var router = express.Router();

let userProperties: string[] = [
  'address', 'username', 'firstName', 'lastName', 'email', 'gender', 'className'
];
router.post('/signup', async function(req: express.Request, res) {
  let user: any = {};
  for (let key of userProperties) {
    user[key] = req.body[key];
  }
  // todo validation here or on the DB
  user = await db.addUser(<User>user).catch(function(reason: any) {
    res.status(500).end(
        'Failed to add user, reason: ' + JSON.stringify(reason));
  });
  if (!user) {
    return;
  }
  let password = req.body.password;
  createUserData(user.username, password);
  res.status(201).end();
});

router.post('/update-details', function(req, res) {
  let user: any = {};
  for (let key of userProperties) {
    if (req.body[key]) {
      user[key] = req.body[key];
    }
  }
  let username = req.user.username;
  let response = db.updateUserById(username, user);
  res.status(201).end();
});

router.get('/user-details', function(req, res) {
  if (req.user) {
    res.json(req.user);
    return;
  }
  res.status(404).end();
});