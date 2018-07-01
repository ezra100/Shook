import {resolve} from 'dns';
// import the mongoose module
import * as mongoose from 'mongoose';

import {helpers} from '../helpers';
import {Gender, IComment, IMinProduct, IProduct, IReview, User, UserAuthData, UserType} from '../types';

import {commentModel, productModel, reviewModel, userAuthDataModel, userModel} from './Models';



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
    username = username.toLowerCase();
    return (await userAuthDataModel.findById(username)).toObject();
  }

  updateUserAuthData(username: string, data: Partial<UserAuthData>):
      Promise<void> {
    username = username.toLowerCase();
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

          if (key === 'username') {
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

  updateUserById(username: string, user: Partial<User>): Promise<User> {
    username = username.toLowerCase();
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
      userModel.findByIdAndRemove(
          user.username.toLowerCase(), (err: Error, user: User) => {
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

  async updateProduct(product: IProduct): Promise<IProduct|null> {
    return (await productModel.findByIdAndUpdate(
                product._id, product, {new /* return the new document*/: true}))
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

  async updateReview(review: IReview): Promise<IReview|null> {
    return (await reviewModel.findByIdAndUpdate(
                review._id, review, {new /* return the new document*/: true}))
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
    reviewModel.deleteMany({productID});
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
    commentModel.deleteMany({reviewID});
  }
  async updateComment(comment: IComment): Promise<IComment|null> {
    return (await commentModel.findByIdAndUpdate(
                comment._id, comment, {new: /* return the new document*/ true}))
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
  //#endregion
}

function getUserKeyType(key: string): string {
  return (<string>(<any>userModel.schema).paths[key].instance).toLowerCase();
}


export var db: MongoDB = new MongoDB();