import {ObjectId} from 'bson';
import * as mongoose from 'mongoose';

import {Order} from '../../types';
import {Schema} from '../helpers';

import {Products} from './Products';



let orderSchema = new Schema({
  owner: String,
  products: [{
    productID: {type: String, ref: 'Product', required: true},
    quantity: {type: Number, required: true, min: 1},
    currentPrice: Number
  }],
  orderDate: {type: Date, default: Date.now()},
  paid: {type: Boolean, default: false}
});

export let orderModel = mongoose.model('Order', orderSchema);
// Order must contain owner name, and products ID and quantity
export namespace orders {
  export async function
  addOrder(order: Partial<Order>, verify: boolean = true) {
    order.paid = false;
    for (var i = 0; i < order.products.length; i++) {
      let tempProduct =
          await Products.getProductByID(order.products[i].productID);
      if (!tempProduct) {
        throw 'Product with product id ' + order.products[i].productID +
            ' doesn\'t exist';
      }
      order.products[i].currentPrice = tempProduct.price;
    }

    return await orderModel.create(order);
  }

  export async function getOrder(
      orderID: string, owner: /*only the owner can access the order*/ string) {
    let doc = await orderModel.findOne({_id: orderID, owner});
    return doc && doc.toObject();
  }

  export async function getOrderByUser(owner: string) {
    let docs = await orderModel.find({owner}).sort('-orderDate').exec();
    return docs;
  }

  export async function markOrderAsPaid(orderID: string) {
    return await orderModel.updateOne({_id: orderID}, {$set: {paid: true}});
  }
  export async function getIDs() {
    return await orderModel.find().select('_id');
  }
}
