import * as express from 'express';

import {createUserData} from '../auth/auth';
import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {User, UserType} from '../types';
export var router = express.Router();

// create a new user
router.post(
    '/signup', helpers.asyncWrapper(async function(req: express.Request, res) {
      let user = await db.addUser(<User>req.body);
      if (!user) {
        console.error('Failed to add user', user);
        throw 'failed to add user';
      }
      let password = req.body.password;
      createUserData(user._id, password);
      res.status(201).json(user);
    }));

// update details about the current user
router.put('/updateDetails', helpers.asyncWrapper(async function(req, res) {
  let user: any = req.body;
  let userId = req.user._id;
  let updatedUser = await db.updateUserById(userId, user);
  res.status(201).json(updatedUser);
}));
// returns the details about the current logged in user
router.get('/me', helpers.asyncWrapper(async function(req, res) {
  if (req.user) {
    res.json(await db.getUser(req.user._id, true));
    return;
  }
  res.status(404).end('You\'re not logged in');
}));
router.get('/user', helpers.asyncWrapper(async function(req, res) {
  let id = req.query._id;
  res.json(await db.getUser(id, false));
  return;
}));
router.put('/follow', helpers.asyncWrapper(async function(req, res) {
  let followee = req.body.followee;
  let follower = req.user._id;
  let dbRes = await db.addFollowee(follower, followee);
  res.json(dbRes);
}));

router.put('/unfollow', helpers.asyncWrapper(async function(req, res) {
  let followee = req.body.followee;
  let follower = req.user._id;
  let dbRes = await db.removeFollowee(follower, followee);
  res.json(dbRes);
}));

router.put('/addToBasket', helpers.asyncWrapper(async function(req, res) {
  let productID = req.body.productID;
  let qunatity = Number(req.body.quantity);
  if (qunatity === 0) {
    return res.json(await db.removeFromBasket(req.user._id, productID));
  }
  return res.json(await db.addToBasket(req.user._id, productID, qunatity));
}));

router.get('/basketSum', helpers.asyncWrapper(async function(req, res) {
  return res.json(await db.getBasketSum(req.user._id));
}));

// it's supposed to be get, but it's easier to send a nested object via post
router.get('/usersList', helpers.asyncWrapper(async function(req, res) {
  let query = helpers.escapeRegExp(req.query.query);
  let filter = {
    $or: [
      {_id: {$regex: query, $options: 'i'}},
      {firstName: {$regex: query, $options: 'i'}},
      {lastName: {$regex: query, $options: 'i'}}
    ]
  };
  let limit = Number(req.query.limit || 150);
  let offset = Number(req.query.offset || 0);
  return res.json(await  db.getUsersList(filter, limit, offset));
}));

