
import * as mongoose from 'mongoose';
import {Aggregate, Model, NativeError} from 'mongoose';

import {helpers} from '../../helpers';
import {Category, Gender, IComment, Product, Review, User, UserAuthData, UserType} from '../../types';
import {chatRoomPermitedFields, commentPermitedFields, productPermitedFields, reviewPermitedFields, stripObject, userPermitedFields} from '../helpers';
import {Schema} from '../helpers';
import {Users} from './users';
let ObjectId = mongoose.Types.ObjectId;

let reviewSchema = new Schema({
  date: {type: Date, default: Date.now, index: true},
  owner: {type: String, required: true, ref: 'User'},
  productID: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },  // product._id
  title: {type: String, required: true, minlength: 5, maxlength: 140},
  fullReview: {type: String, required: true},
  rating: {type: Number, min: 1, max: 5},  // 1-5 stars
  likes: [{type: String, required: true, ref: 'User'}],

  // the count is for cases when the likes array is spliced (for optimization)
  // it isn't required for insertion, but supposed to created in the post find
  // hooks
  likesCount: Number,
  dislikes: [{type: String, required: true, ref: 'User'}],
  dislikesCount: Number,

});
reviewSchema.postAnyFInd(function(
    doc: mongoose.Document, next: Function): void {
  let d: mongoose.Document&Review = <any>doc;
  if (d.likes && d.dislikes) {
    d.likesCount = d.likes.length;
    d.dislikesCount = d.dislikes.length;
  }
  next();
});



reviewSchema.preAnyUpdate(function(next: Function): void {
  let update: any = this.getUpdate();
  delete update.owner;
  delete update.date;
  delete update.productID;
  next();
});
export namespace Reviews {
  export let reviewModel = mongoose.model('Review', reviewSchema);

  export async function addReview(review: Review, secure: boolean = true):
      Promise<Review> {
    if (secure) {
      review.dislikes = [];
      review.likes = [];
      review.date = new Date();
    }
    let doc = await reviewModel.create(review);
    return doc && doc.toObject();
  }

  export async function updateReview(review: Partial<Review>, owner: string):
      Promise<Review> {
    review = stripObject(review, reviewPermitedFields);
    let doc = await reviewModel.findOneAndUpdate(
        {_id: review._id, owner: owner || 'block undefined'}, {$set: review},
        {new /* return the new document*/: true});
    return doc && doc.toObject();
  }
  export async function deleteReview(id: string) {
    let doc = await reviewModel.findByIdAndRemove(id);
    return doc && doc.toObject();
  }
  export async function deleteReviewsByProductID(productID: string) {
    let reviews = await getLatestReviews({productID: productID});
    let results =
        (await reviewModel.remove({productID: new ObjectId(productID)}));
    return results;
  }
  export async function getReviewByID(id: string): Promise<Review> {
    let doc = await reviewModel.findById(id);
    return doc && doc.toObject();
  }
  export async function getLatestReviews(
      filter: Partial<Review> = {}, offset: number = 0,
      limit?: number): Promise<Review[]> {
    let res = reviewModel.find(filter).sort('-date').skip(offset);
    if (limit) {
      res.limit(limit);
    }
    return (await res.exec()).map(doc => doc.toObject());
  }


  export async function likeReview(id: string, username: string) {
    return (await reviewModel
                .update(
                    {_id: id},
                    {$addToSet: {likes: username}, $pull: {dislikes: username}})
                .exec());
  }
  export async function dislikeReview(id: string, username: string) {
    return await reviewModel
        .update(
            {_id: id},
            {$pull: {likes: username}, $addToSet: {dislikes: username}})
        .exec();
  }
  export async function
  removeLikeDislikeFromReview(id: string, username: string) {
    return await reviewModel
        .update({_id: id}, {$pull: {likes: username, dislikes: username}})
        .exec();
  }

  export async function
  getReviewsFromFollowees(username: string, offset: number = 0, limit?: number):
      Promise<Product[]> {
    let userDoc = (await Users.userModel.findById(username));
    if (!userDoc) {
      throw 'User not found';
    }
    let followees = userDoc.toObject().follows;
    let agg = reviewModel.aggregate()
                  .match({'owner': {$in: followees}})
                  .sort('-date')
                  .skip(offset);
    if (limit) {
      agg.limit(limit);
    }
    return await agg;
  }
  export async function getIDs() {
    return reviewModel.find().select('_id');
  }
  export async function getCount() {
    return await reviewModel.estimatedDocumentCount().exec();
  }
}