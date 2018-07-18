import * as express from 'express';

import {createUserData} from '../auth/auth';
import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {User} from '../types';

export var router = express.Router();

let userProperties: string[] =
    ['_id', 'address', 'firstName', 'lastName', 'email', 'gender', 'className'];
// create a new user
router.post(
    '/signup', helpers.asyncWrapper(async function(req: express.Request, res) {
      let user: any = {};
      for (let key of userProperties) {
        user[key] = req.body[key];
      }
      user = await db.addUser(<User>user);
      if (!user) {
        return;
      }
      let password = req.body.password;
      createUserData(user._id, password);
      res.status(201).end();
    }));

// update details about the current user
router.put('/updateDetails', function(req, res) {
  let user: any = {};
  for (let key of userProperties) {
    if (req.body[key]) {
      user[key] = req.body[key];
    }
  }
  let username = req.user._id;
  let response = db.updateUserById(username, user);
  res.status(201).end('Your details were updated successfully');
});
// returns the details about the current logged in user
router.get('/me', helpers.asyncWrapper(async function(req, res) {
  if (req.user) {
    res.json(await db.getUser(req.user._id, true));
    return;
  }
  res.status(404).end('You\'re not logged in');
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

router.post('/addToBasket', helpers.asyncWrapper(async function(req, res) {
  let productID = req.body.productID;
  let qunatity = Number(req.body.quantity || 1);
  return res.json(await db.addToBasket(req.user._id, productID, qunatity));
}));


router.delete(
    '/removeFromBasket', helpers.asyncWrapper(async function(req, res) {
      let productID = req.query.productID;
      return res.json(await db.removeFromBasket(req.user._id, productID));
    }));

router.get('/basketSum', helpers.asyncWrapper(async function(req, res) {
  return res.json(await db.getBasketSum(req.user._id));
}));
