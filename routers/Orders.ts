import * as express from 'express';

import {db} from '../DB/MongoDB';
import {helpers} from '../helpers';
import {ChatRoom, Message, Order, User} from '../types';

export var router = express.Router();

router.post('/addOrder', helpers.asyncWrapper(async function(req, res){
  if (!req.user._id) {
    throw 'You\'re not logged in';
  }
  let order: Order = req.body;
  order.owner = req.user._id;
  res.json(await db.orders.addOrder(order));
}));

router.get("/myOrders", helpers.asyncWrapper(
    async function(req, res){
        if (!req.user._id) {
            throw 'You\'re not logged in';
          }
        res.json(await db.orders.getOrderByUser(req.user._id));
    }
));

router.get(/\/orderByID/i, helpers.asyncWrapper(
    async function(req, res){
        if (!req.user._id) {
            throw 'You\'re not logged in';
          }
          let orderID = req.query.orderID;
        res.json(await db.orders.getOrder(orderID, req.user._id));
    }
));