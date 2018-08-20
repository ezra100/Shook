import * as express from 'express';

import {createUserData} from '../auth/auth';
import {Users} from '../DB/Models';
import {helpers} from '../helpers';
import upload from '../multer';
import {User, UserType} from '../types';
import { Db } from 'mongodb';

export var router = express.Router();

// create a new user
router.post(
    '/signup', upload.any(),
    helpers.asyncWrapper(async function(req: express.Request, res) {
      let user: User = req.body;
      let files = <Express.Multer.File[]>req.files;
      if (files && files[0]) {
        user.imageURL = '/pub/img/' + files[0].filename;
      }
      user = await Users.addUser(user);
      if (!user) {
        console.error('Failed to add user', user);
        throw 'failed to add user';
      }
      let password = req.body.password;
      createUserData(user._id, password);
      res.status(201).json(user);
    }));

// update details about the current user
router.put('/updateDetails', (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(400).end('you\'re not logged in');
  }
}, upload.any(), helpers.asyncWrapper(async function(req, res) {
  let user: any = req.body;
  // delete empty fields so that they won't be updated
  for (let key in user) {
    if (!user[key]) {
      delete user[key];
    }
  }
  let files = <Express.Multer.File[]>req.files;
  if (files && files[0]) {
    user.imageURL = '/pub/img/' + files[0].filename;
  }
  let userId = req.user._id;
  if (req.body.password) {
    createUserData(user._id, req.body.password);
  }
  let updatedUser = await Users.updateUserById(userId, user);
  res.status(201).json(updatedUser);
}));
// returns the details about the current logged in user
router.get('/me', helpers.asyncWrapper(async function(req, res) {
  if (req.user) {
    res.json(await Users.getUser(req.user._id, true));
    return;
  }
  res.status(404).end('You\'re not logged in');
}));
router.get('/user', helpers.asyncWrapper(async function(req, res) {
  let id = req.query._id;
  res.json(await Users.getUser(id, false));
  return;
}));
router.put('/follow', helpers.asyncWrapper(async function(req, res) {
  let followee = req.body.followee;
  let follower = req.user._id;
  let dbRes = await Users.addFollowee(follower, followee);
  res.json(dbRes);
}));

router.put('/unfollow', helpers.asyncWrapper(async function(req, res) {
  let followee = req.body.followee;
  let follower = req.user._id;
  let dbRes = await Users.removeFollowee(follower, followee);
  res.json(dbRes);
}));

router.put('/addToBasket', helpers.asyncWrapper(async function(req, res) {
  let productID = req.body.productID;
  let qunatity = Number(req.body.quantity);
  if (qunatity === 0) {
    return res.json(await Users.removeFromBasket(req.user._id, productID));
  }
  return res.json(await Users.addToBasket(req.user._id, productID, qunatity));
}));

router.get('/basket', helpers.asyncWrapper(async function(req, res) {
  return res.json(await Users.getBasket(req.user._id));
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
  return res.json(await Users.getUsersList(filter, limit, offset));
}));

router.put('/makeOrder',  helpers.asyncWrapper(async function(req, res) {

  if(!req.user){
    throw 'you\'re not logged in';
  }
  let results = await Users.makeOrder(req.user._id);
  return res.json(results);
}));