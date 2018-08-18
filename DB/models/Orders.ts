import * as mongoose from 'mongoose';
import {Aggregate, Model, NativeError} from 'mongoose';

import {helpers} from '../../helpers';
import {Category, Gender, IComment, Review, User, UserAuthData, UserType, Product, Order} from '../../types';
import {Schema} from '../helpers';
import {chatRoomPermitedFields, commentPermitedFields, productPermitedFields, reviewPermitedFields, stripObject, userPermitedFields} from '../helpers';
import { Products } from './Products';



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

export namespace orders {
    export async function addOrder(order: Order) {
      order.paid = false;
      let productIDList = order.products.map(p => p.productID);
      let productDocs =
          <any[]>await Products.productModel.find({_id: {$in: productIDList}}).exec();
      order.products.forEach(p => {
        let tempProduct = productDocs.find(pr => pr.productID === p.productID);
        if (!tempProduct) {
          throw 'Product with product id ' + p.productID + ' doesn\'t exist';
        }
        p.currentPrice = tempProduct.price;
      });
      return await orderModel.create(order);
    }

    export async function getOrder(
        orderID: string,
        owner: /*only the owner can access the order*/ string) {
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
    export async function getIDs(){
      return await orderModel.find().select('_id');
    }
  }
