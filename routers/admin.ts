import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {User, UserType} from '../types';
export var router = express.Router();

router.put('/authorizeUser', helpers.asyncWrapper(async function(req, res) {
  if (!(req.user && req.user.userType === UserType.Admin)) {
    throw 'You\'re not an admin';
  }
  let userID = req.body.userID;
  return res.json(await db.authorizeUser(userID));
}));

router.put('/deleteUser', helpers.asyncWrapper(async function(req, res) {
  if (!(req.user && req.user.userType === UserType.Admin)) {
    throw 'You\'re not an admin';
  }
  let userID = req.body.userID;
  return res.json(await db.deleteUser(userID));
}));

router.get('/usersToAuthorize', helpers.asyncWrapper(async function(req, res) {
  if (!(req.user && req.user.userType === UserType.Admin)) {
    throw 'You\'re not an admin';
  }
  let limit = Number(req.query.limit || 150);
  let offset = Number(req.query.offset || 0);
  return res.json(await db.getUsers({isAuthorized: false}, offset,limit, true));
}));

