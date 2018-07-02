import {resolve} from 'dns';
// import the mongoose module
import * as mongoose from 'mongoose';

import {helpers} from '../helpers';
import {Gender, IComment, IProduct, IReview, User, UserAuthData, UserType} from '../types';

import {commentModel, productModel, reviewModel, userAuthDataModel, userModel} from './Models';

let ObjectId = mongoose.Types.ObjectId;

// set up default mongoose connection
var connectionString: string = 'mongodb://127.0.0.1/shook';
mongoose.connect(connectionString);

// get the default connection
export var mongoConnection: mongoose.Connection = mongoose.connection;



// bind connection to error event (to get notification of connection errors)
mongoConnection.on(
    'error', console.error.bind(console, 'MongoDB connection error:'));

class MongoDB {
  async getUserAuthData(username: string): Promise<UserAuthData> {
    return (await userAuthDataModel.findById(username)).toObject();
  }

  updateUserAuthData(username: string, data: Partial<UserAuthData>):
      Promise<void> {
    return new Promise((resolve, reject) => {
      userAuthDataModel.findByIdAndUpdate(
          username, data, {upsert: true}, (err: Error, data: UserAuthData) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
    });
  }
  createUserAuthData(data: UserAuthData): Promise<void> {
    return new Promise((resolve, reject) => {
      userAuthDataModel.create(data, (err: Error, rData: UserAuthData) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }



  async findUserByEmail(email: string): Promise<User> {
    return (await userModel.findOne({email: email})).toObject();
  }

  //#region users
  // todo: update this
  getUsers(filter: any = {}): Promise<User[]> {
    for (const key of Object.keys(filter)) {
      if (filter[key] === '') {
        delete filter[key];
        continue;
      }
      switch (getUserKeyType(key)) {
        case 'string':

          if (key === '_id') {
            // it it's username, just make sure that the search is case
            // insensitive
            filter[key] = new RegExp(helpers.escapeRegExp(filter[key]), 'i');
          } else {
            // replace it with a regex that will search for any one of the given
            // words
            filter[key] = new RegExp(
                filter[key]
                    .split(/\s+/)
                    // escape regex characters
                    .map(
                        (v: any) =>
                            v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
                    .join('|'),
                'gi');
          }
          break;
        case 'boolean':

          if (typeof filter[key] === 'string') {
            filter[key] = (filter[key] === 'true');
          }
          break;
        case 'number':
          // exception for 'gender' since it's an enum
          if (typeof filter[key] === 'string' ||
              filter[key] instanceof String) {
            filter[key] = parseInt(filter[key], 10);
          }
          if (key === 'gender' && filter[key] === 0) {
            delete filter[key];
          }
      }
    }
    return new Promise<User[]>((resolve, reject) => {
      userModel.find(filter, (err: Error, users: User[]) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(users);
      });
    });
  }
  getUser(username: string): Promise<User|null> {
    return new Promise<User|null>((resolve, reject) => {
      userModel.findById(username.toLowerCase(), (err: Error, user: User) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(user);
      });
    });
  }

  async addFollowee(follower: string, followee: string) {
    followee = followee.toLowerCase();
    follower = follower.toLowerCase();
    // validate the followee, we assume the follower is validated by the calling
    // function
    let doc = (await userModel.findById(followee).exec());
    if (!doc) {
      return 'followee doesn\'t exist';
    }
    return (
        await userModel
            .update(
                {_id: follower.toLowerCase()}, {$addToSet: {follows: followee}})
            .exec());
  }
  async removeFollowee(follower: string, followee: string) {
    followee = followee.toLowerCase();
    follower = follower.toLowerCase();
    return (
        await userModel
            .update({_id: follower.toLowerCase()}, {$pull: {follows: followee}})
            .exec());
  }

  updateUserById(username: string, user: Partial<User>): Promise<User> {
    user = {
      address: user.address,
      email: user.email,
      imageURL: user.imageURL,
      gender: user.gender,
      firstName: user.firstName,
      lastName: user.lastName
    };
    return new Promise((resolve, reject) => {
      userModel.findByIdAndUpdate(
          username, user, (err: Error, oldUser: User) => {
            if (err) {
              reject(err);
              return;
            }
            // sending back the new one
            resolve(Object.assign([], oldUser, user));
          });
    });
  }
  addUser(user: User): Promise<User|null> {
    return new Promise((resolve, reject) => {
      let userDoc: any = new userModel(user);
      userDoc.save((err: Error, user: User) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(user);
      });
    });
  }
  deleteUser(user: User): Promise<User|null> {
    return new Promise((resolve, reject) => {
      userModel.findByIdAndRemove(user._id, (err: Error, user: User) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(user);
      });
    });
  }
  //#endregion
  //#region  product
  async addProduct(product: Partial<IProduct>, secure: boolean = true):
      Promise<IProduct> {
    if (secure) {
      product.creationDate = new Date();
    }
    return (await productModel.create(product)).toObject();
  }

  async updateProduct(product: Partial<IProduct>, owner: string):
      Promise<IProduct|null> {
    product = {
      link: product.link,
      subtitle: product.subtitle,
      title: product.title
    };
    return (await productModel.findOneAndUpdate(
                {_id: product._id, owner: owner || 'block undefined'}, product,
                {new /* return the new document*/: true}))
        .toObject();
  }
  async deleteProduct(id: string, removeReviews: boolean = true) {
    if (removeReviews) {
      this.deleteReviewsByProductID(id);
    }
    return (await productModel.findByIdAndRemove(id)).toObject();
    ;
  }
  async getProductByID(id: string): Promise<IProduct> {
    return (await productModel.findById(id)).toObject();
  }
  async getLatestProducts(
      filter: Partial<IProduct> = {}, offset: number = 0,
      limit?: number): Promise<IProduct[]> {
    let res = productModel.find(filter).sort('-creationDate').skip(offset);
    if (limit) {
      res.limit(limit);
    }
    return (await res.exec()).map(doc => doc.toObject());
  }
  async getProductsFromFollowees(
      username: string, offset: number = 0,
      limit?: number): Promise<IProduct[]> {
    let followees = (await userModel.findById(username)).toObject().follows;
    let agg = productModel.aggregate()
                  .match({'owner': {$in: followees}})
                  .sort('-creationDate')
                  .skip(offset);
    if (limit) {
      agg.limit(limit);
    }
    return await agg;
  }
  //#endregion

  //#region review
  async addReview(review: IReview, secure: boolean = true): Promise<IReview> {
    if (secure) {
      review.dislikes = [];
      review.likes = [];
      review.creationDate = new Date();
    }
    return (await reviewModel.create(review)).toObject();
  }

  async updateReview(review: Partial<IReview>, owner: string):
      Promise<IReview|null> {
    review = {
      title: review.title,
      rating: review.rating,
      fullReview: review.fullReview
    };
    return (await reviewModel.findOneAndUpdate(
                {_id: review._id, owner: owner || 'block undefined'}, review,
                {new /* return the new document*/: true}))
        .toObject();
  }
  async deleteReview(id: string, removeComments: boolean = true) {
    if (removeComments) {
      this.deleteCommentsByReviewID(id);
    }
    return (await reviewModel.findByIdAndRemove(id)).toObject();
  }
  async deleteReviewsByProductID(productID: string) {
    let reviews = await this.getLatestReviews({productID: productID});
    reviews.forEach((review) => {
      this.deleteCommentsByReviewID(review._id);
    });
    let results =
        (await reviewModel.remove({productID: new ObjectId(productID)}));
    return results;
  }
  async getReviewByID(id: string): Promise<IReview> {
    return (await reviewModel.findById(id)).toObject();
  }
  async getLatestReviews(
      filter: Partial<IReview> = {}, offset: number = 0,
      limit?: number): Promise<IReview[]> {
    let res = reviewModel.find(filter).sort('-creationDate').skip(offset);
    if (limit) {
      res.limit(limit);
    }
    return (await res.exec()).map(doc => doc.toObject());
  }

  async getProductRating(productID: string): Promise<number> {
    return (await reviewModel.aggregate()
                .match({productID: mongoose.Types.ObjectId(productID)})
                .group({_id: '$productID', avg: {$avg: '$rating'}}))[0]
        .avg;
  }
  async likeReview(id: string, username: string) {
    return (await reviewModel
                .update(
                    {_id: id},
                    {$addToSet: {likes: username}, $pull: {dislikes: username}})
                .exec());
  }
  async dislikeReview(id: string, username: string) {
    return await reviewModel
        .update(
            {_id: id},
            {$pull: {likes: username}, $addToSet: {dislikes: username}})
        .exec();
  }
  async removeLikeDislikeFromReview(id: string, username: string) {
    return await reviewModel
        .update({_id: id}, {$pull: {likes: username, dislikes: username}})
        .exec();
  }
  //#endregion

  //#region comment
  async addComment(comment: IComment, secure: boolean = true):
      Promise<IComment> {
    if (secure) {
      comment.creationDate = new Date();
      comment.dislikes = [];
      comment.likes = [];
    }
    return (await commentModel.create(comment)).toObject();
  }
  async deleteComment(id: string) {
    commentModel.findByIdAndRemove(id);
  }
  async deleteCommentsByReviewID(reviewID: string) {
    let results = await commentModel.remove({reviewID: new ObjectId(reviewID)});
    return results;
  }
  async updateComment(comment: Partial<IComment>, owner: string):
      Promise<IComment|null> {
    comment = {comment: comment.comment};
    return (await commentModel.findOneAndUpdate(
                {_id: comment._id, owner: owner || 'block undefined'}, comment,
                {new: /* return the new document*/ true}))
        .toObject();
  }
  async getCommentByID(id: string): Promise<IComment> {
    return (await commentModel.findById(id)).toObject();
  }
  async getLatestComments(
      filter: Partial<IComment> = {}, offset: number = 0,
      limit?: number): Promise<IComment[]> {
    let res = commentModel.find(filter).sort('-creationDate').skip(offset);
    if (limit) {
      res.limit(limit);
    }
    return (await res.exec()).map(doc => doc.toObject());
  }

  async likeComment(id: string, username: string) {
    return (await commentModel
                .update(
                    {_id: id},
                    {$addToSet: {likes: username}, $pull: {dislikes: username}})
                .exec());
  }
  async dislikeComment(id: string, username: string) {
    return await commentModel
        .update(
            {_id: id},
            {$pull: {likes: username}, $addToSet: {dislikes: username}})
        .exec();
  }
  async removeLikeDislikeFromComment(id: string, username: string) {
    return await commentModel
        .update({_id: id}, {$pull: {likes: username, dislikes: username}})
        .exec();
  }
  //#endregion
}

function getUserKeyType(key: string): string {
  return (<string>(<any>userModel.schema).paths[key].instance).toLowerCase();
}


export var db: MongoDB = new MongoDB();