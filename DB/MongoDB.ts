import {resolve} from 'dns';
// import the mongoose module
import * as mongoose from 'mongoose';
import {helpers} from '../helpers';
import {Gender, IComment, IProduct, IReview, User, UserAuthData, UserType, IMinProduct} from '../types';

import {productModel, reviewModel, userAuthDataModel, userModel} from './Models';


let ObjectId = mongoose.Schema.Types.ObjectId;

// set up default mongoose connection
var connectionString: string = 'mongodb://127.0.0.1/shook';
mongoose.connect(connectionString);

// get the default connection
export var mongoConnection: mongoose.Connection = mongoose.connection;



// bind connection to error event (to get notification of connection errors)
mongoConnection.on(
    'error', console.error.bind(console, 'MongoDB connection error:'));

class MongoDB {
  getUserAuthData(username: string): Promise<UserAuthData> {
    username = username.toLowerCase();
    return new Promise<UserAuthData>((resolve, reject) => {
      userAuthDataModel.findById(username, (err: Error, data: UserAuthData) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
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



  findUserByEmail(email: string): Promise<User> {
    return new Promise<User|null>((resolve, reject) => {
      userModel.findOne({email: email}, (err: Error, user: User) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(user);
      });
    });
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
          // replace it with a regex that will search for any one of the given
          // words
          filter[key] = new RegExp(
              filter[key]
                  .split(/\s+/)
                  // escape regex characters
                  .map(
                      (v: any) => v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
                  .join('|'),
              'gi');
          break;
        case 'boolean':

          if (typeof filter[key] === 'string') {
            if (filter[key] === '') {
              delete filter[key];
            } else {
              filter[key] = (filter[key] === 'true');
            }
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
      userModel.findById(username, (err: Error, user: User) => {
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

  async addProduct(product: IMinProduct): Promise<IProduct> {
    (<any>product._id) = mongoose.Types.ObjectId();
    return (await productModel.create(product)).toObject();
  }

  async updateProduct(product: IProduct): Promise<IProduct|null> {
    return (await productModel.findByIdAndUpdate(
                new ObjectId(product._id), product))
        .toObject();
  }
  async getProductByID(id: string): Promise<IProduct> {
    // todo - check that the returned object returns a string for objectID's
    return (await productModel.findById(id)).toObject();
  }
  async getLatestProducts(
      username?: string, offset: number = 0,
      limit?: number): Promise<IProduct[]> {
    let filter = username?{username}:username;
    let res = productModel.find(filter).sort('-creationDate').skip(offset);
    if (limit) {
      res.limit(limit);
    }
    return (await res.exec()).map(doc => doc.toObject());
  }
}

function getUserKeyType(key: string): string {
  return (<string>(<any>userModel.schema).paths[key].instance).toLowerCase();
}


export var db: MongoDB = new MongoDB();