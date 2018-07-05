import {resolve} from 'dns';
// import the mongoose module
import * as mongoose from 'mongoose';

import {helpers} from '../helpers';
import {ChatRoom, Gender, IComment, IProduct, IReview, User, UserAuthData, UserType} from '../types';

import {chatRoomModel, commentModel, messageModel, productModel, reviewModel, userAuthDataModel, userModel} from './Models';
import { stripObject, userPermitedFields, productPermitedFields, reviewPermitedFields, commentPermitedFields, chatRoomPermitedFields } from './StripForUpdate';

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
    let doc = await userAuthDataModel.findById(username);
    return doc && doc.toObject();
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
    let doc = await userModel.findOne({email: email});
    return doc && doc.toObject();
  }

  //#region users
  // todo: update this
  async getUsers(
      filter: any = {}, offset: number = 0, limit?: number,
      showPrivateData: boolean = false): Promise<Partial<User>[]> {
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
    let query = userModel.find(filter).sort('-_id').skip(offset);
    if (limit) {
      query.limit(limit);
    }
    let users: Partial<User>[] = await query;
    return users.map(user => {
      return {
        _id: user._id, firstName: user.firstName, lastName: user.lastName,
            gender: user.gender, userType: user.userType,
            imageURL: user.imageURL
      }
    });
  }
  async getUser(username: string, showPrivateData: boolean = false):
      Promise<Partial<User>> {
    let user: Partial<User> = await userModel.findById(username.toLowerCase());
    if (showPrivateData) {
      user = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        userType: user.userType,
        imageURL: user.imageURL
      };
    }
    return user;
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


  async addToBasket(username: string, productID: string) {
    let doc = await this.getProductByID(productID);
    if (!doc) {
      return 'product ID ' + productID + ' doesn\'t exist';
    }
    return (
        await userModel
            .update({_id: username}, {$addToSet: {basket: ObjectId(productID)}})
            .exec());
  }

  async removeFromBasket(username: string, productID: string) {
    return (await userModel
                .update({_id: username}, {$pull: {basket: ObjectId(productID)}})
                .exec());
  }

  updateUserById(username: string, user: Partial<User>): Promise<User> {
    user = stripObject(user, userPermitedFields);
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
    let retProduct = await productModel.create(product);
    return retProduct && retProduct.toObject();
  }

  async updateProduct(product: Partial<IProduct>, owner: string):
      Promise<IProduct|null> {
    product = stripObject(product, productPermitedFields);
    let doc = (await productModel.findOneAndUpdate(
        {_id: product._id, owner: owner || 'block undefined'}, product,
        {new /* return the new document*/: true}));
    return doc && doc.toObject();
  }
  async deleteProduct(id: string, removeReviews: boolean = true) {
    if (removeReviews) {
      this.deleteReviewsByProductID(id);
    }
    let doc = await productModel.findByIdAndRemove(id);
    return doc && doc.toObject();
  }
  async getProductByID(id: string): Promise<IProduct> {
    let doc = await productModel.findById(id);
    return doc && doc.toObject();
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
    let user = await userModel.findById(username);
    if (!user) {
      throw 'User ' + username + ' not found';
    }
    let followees = user.toObject().follows;
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
    let doc = await reviewModel.create(review);
    return doc && doc.toObject();
  }

  async updateReview(review: Partial<IReview>, owner: string):
      Promise<IReview|null> {
    review = stripObject(review, reviewPermitedFields);
    let doc = await reviewModel.findOneAndUpdate(
        {_id: review._id, owner: owner || 'block undefined'}, review,
        {new /* return the new document*/: true});
    return doc && doc.toObject();
  }
  async deleteReview(id: string, removeComments: boolean = true) {
    if (removeComments) {
      this.deleteCommentsByReviewID(id);
    }
    let doc = await reviewModel.findByIdAndRemove(id);
    return doc && doc.toObject();
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
    let doc = await reviewModel.findById(id);
    return doc && doc.toObject();
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

  async getReviewsFromFollowees(
      username: string, offset: number = 0,
      limit?: number): Promise<IProduct[]> {
    let userDoc = (await userModel.findById(username));
    if (!userDoc) {
      throw 'User not found';
    }
    let followees = userDoc.toObject().follows;
    let agg = reviewModel.aggregate()
                  .match({'owner': {$in: followees}})
                  .sort('-creationDate')
                  .skip(offset);
    if (limit) {
      agg.limit(limit);
    }
    return await agg;
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
    comment = stripObject(comment, commentPermitedFields);
    return (await commentModel.findOneAndUpdate(
                {_id: comment._id, owner: owner || 'block undefined'}, comment,
                {new: /* return the new document*/ true}))
        .toObject();
  }
  async getCommentByID(id: string): Promise<IComment> {
    let doc = (await commentModel.findById(id));
    return doc && doc.toObject();
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

  //#region chat
  async addRoom(name: string, owner: string, admins: string[]) {
    // remove duplicates
    admins = [...new Set(admins)];
    let room: Partial <ChatRoom>= {name, owner, admins};
    let doc = await chatRoomModel.create(room);
    return doc && doc.toObject();
  }

  async updateRoom(id: number, owner : string, chatRoom :ChatRoom){
    chatRoom = stripObject(chatRoom, chatRoomPermitedFields);
    let doc = await chatRoomModel.findOneAndUpdate({_id: id, owner: owner}, chatRoom);
    return doc && doc.toObject();
  }

  async addMessage(content : string){
    
  }
  //#endregion
}

function getUserKeyType(key: string): string {
  return (<string>(<any>userModel.schema).paths[key].instance).toLowerCase();
}


export var db: MongoDB = new MongoDB();