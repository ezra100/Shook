import * as mongoose from 'mongoose';
import {Aggregate, Model, NativeError} from 'mongoose';

import {helpers} from '../../helpers';
import {Category, Gender, IComment, Product, Review, User, UserAuthData, UserType} from '../../types';
import {chatRoomPermitedFields, commentPermitedFields, productPermitedFields, reviewPermitedFields, stripObject, userPermitedFields} from '../helpers';
import {Schema} from '../helpers';
import { Reviews } from './Reviews';
import { Users } from './users';

let productSchema: Schema = new Schema({
  date: {type: Date, default: Date.now, index: true},
  title: {type: String, required: true, minlength: 6, maxlength: 140},
  subtitle: {type: String, required: true},
  owner: {type: String, required: true, ref: 'User', index: true},
  link: {
    type: String,
    required: function() {
      return !this.link || helpers.isValidURL(this.link)
    }
  },
  price: {type: Number, required: true},
  category:
      {type: Number, required: true, max: Category.Vehicles, index: true}
});

productSchema.preAnyUpdate(function(next: Function): void {
  let update: any = this.getUpdate();
  delete update.owner;
  delete update.date;

  next();
});

export namespace Products {
  export let productModel = mongoose.model('Product', productSchema);

  export async function getProductRating(productID: string): Promise<number> {
    return (await Reviews.reviewModel.aggregate()
                .match({productID: mongoose.Types.ObjectId(productID)})
                .group({_id: '$productID', avg: {$avg: '$rating'}}))[0]
        .avg;
  }
  export async function addProduct(
      product: Partial<Product>, secure: boolean = true): Promise<Product> {
    if (secure) {
      product.date = new Date();
    }
    let retProduct = await productModel.create(product);
    return retProduct && retProduct.toObject();
  }

  export async function updateProduct(product: Partial<Product>, owner: string):
      Promise<Product> {
    product = stripObject(product, productPermitedFields);
    let doc = (await productModel.findOneAndUpdate(
        {_id: product._id, owner: owner || 'block undefined'}, {$set: product},
        {new /* return the new document*/: true}));
    return doc && doc.toObject();
  }
  export async function
  deleteProduct(id: string, removeReviews: boolean = true) {
    if (removeReviews) {
      Reviews.deleteReviewsByProductID(id);
    }
    let doc = await productModel.findByIdAndRemove(id);
    return doc && doc.toObject();
  }
  export async function getProductByID(id: string): Promise<Product> {
    let doc = await productModel.findById(id);
    return doc && doc.toObject();
  }
  export async function getLatestProducts(
      filter: Partial<Product> = {}, offset: number = 0,
      limit?: number): Promise<Product[]> {
    let res = productModel.find(filter).sort('-date').skip(offset);
    if (limit) {
      res.limit(limit);
    }
    return (await res.exec()).map(doc => doc.toObject());
  }

  // export async function addCategory() {
  //   let products =
  //       await productModel.find({category: {$exists: false}}).select('_id');
  //   products.forEach((async product => {
  //     let update = await productModel.updateOne(
  //         {_id: product._id},
  //         {$set: {category: faker.random.number(Category.Max - 1)}});
  //     console.log(update);
  //   }));
  // }

  export async function getProductsFromFollowees(
      username: string, offset: number = 0,
      limit?: number): Promise<Product[]> {
    let user = await Users.userModel.findById(username);
    if (!user) {
      throw 'User ' + username + ' not found';
    }
    let followees = user.toObject().follows;
    let agg = productModel.aggregate()
                  .match({'owner': {$in: followees}})
                  .sort('-date')
                  .skip(offset);
    if (limit) {
      agg.limit(limit);
    }
    return await agg;
  }
  export async function getIDs(){
    return productModel.find().select('_id');
  }

  export async function getCount() {
    return await productModel.estimatedDocumentCount().exec();
  }
}