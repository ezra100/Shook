import * as mongoose from 'mongoose';
import {Aggregate, Model, NativeError} from 'mongoose';

import {helpers} from '../../helpers';
import {Category, Gender, IComment, Review, User, UserAuthData, UserType} from '../../types';
import {chatRoomPermitedFields, commentPermitedFields, productPermitedFields, reviewPermitedFields, stripObject, userPermitedFields} from '../helpers';
import {Schema} from '../helpers';
import {Products} from './Products';

let userSchema: Schema = new Schema({
  _id: String,
  userType: {
    type: Number,
    required: function() {
      return this.userType in UserType;
    }
  },
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {
    type: String,
    required: function() {
      return helpers.validateEmail(this.email)
    },
    unique: true
  },
  gender: {
    type: Number,
    required: function() {
      return this.gender in Gender;
    }
  },
  address: {type: String, required: true},
  imageURL: {
    type: String,
    required: function() {
      return helpers.isValidURL(this.imageURL)
    }
  },
  follows: [{type: String, required: true, ref: 'User'}],
  basket: [{
    productID: {type: Schema.Types.ObjectId, required: true, ref: 'Product'},
    quantity: {type: Number, required: true, min: 1},
    _id: false
  }],
  isAuthorized: {type: Boolean, default: false}
});


userSchema.pre('save', function(next: Function): void {
  this._id = this._id.toLowerCase();
  next();
});

export namespace Users {
  export let userModel: mongoose.Model<any> =
      mongoose.model('User', userSchema);

  export async function findUserByEmail(email: string): Promise<User> {
    let doc = await userModel.findOne({email: email});
    return doc && doc.toObject();
  }

  export async function authorizeUser(userID: string, adminID?: string) {
    // verify that it's an admin if needed
    if (adminID) {
      let admin: User = (await userModel.findById(adminID)).toObject();
      if (admin.userType !== UserType.Admin) {
        throw 'You\'re not the admin';
      }
    }
    return await userModel.findOneAndUpdate(
        {_id: userID}, {$set: {isAuthorized: true}});
  }
  export async function getUsers(
      filter: any = {}, offset: number = 0, limit?: number,
      showPrivateData: boolean = false): Promise<User[]> {
    let query = userModel.find(filter).sort('-_id').skip(offset);
    if (limit) {
      query.limit(limit);
    }
    if (!showPrivateData) {
      query.select('_id firstName lastName gender userType imageURL');
    }
    let users: User[] = await query;
    return users;
  }
  export async function
  getUser(username: string, showPrivateData: boolean = false):
      Promise<Partial<User>> {
    let query = userModel.findById(username.toLowerCase());
    if (!showPrivateData) {
      query.select('_id firstName lastName gender userType imageURL');
    }
    let doc = await query;
    return doc && doc.toObject();
  }

  export async function
  getUsersList(filter: any = {}, limit?: number, skip?: number) {
    let query = userModel.find(filter).select(
        '_id firstName lastName gender userType imageURL');
    if (limit) {
      query.limit(limit);
    }
    if (skip) {
      query.skip(skip);
    }
    return await query;
  }



  export async function addFollowee(follower: string, followee: string) {
    followee = followee.toLowerCase();
    follower = follower.toLowerCase();
    // validate the followee, we assume the follower is validated by the calling
    // function
    let doc = (await userModel.findById(followee).exec());
    if (!doc) {
      return 'followee doesn\'t exist';
    }
    return (await userModel
                .update(
                    {_id: follower.toLowerCase(), isAuthorized: true},
                    {$addToSet: {follows: followee}})
                .exec());
  }
  export async function removeFollowee(follower: string, followee: string) {
    followee = followee.toLowerCase();
    follower = follower.toLowerCase();
    return (
        await userModel
            .update({_id: follower.toLowerCase()}, {$pull: {follows: followee}})
            .exec());
  }

  // todo
  export async function
  addToBasket(username: string, productID: string, quantity: number = 1) {
    let doc = await Products.getProductByID(productID);
    if (!doc) {
      return 'product ID ' + productID + ' doesn\'t exist';
    }
    await userModel
        .updateOne(
            {
              _id: username,
            },
            {$pull: {basket: {'productID': productID}}})
        .exec();

    return (
        await userModel
            .updateOne(
                {
                  _id: username,
                },
                {
                  $push: {basket: {productID: productID, quantity: quantity}},
                })
            .exec());
  }

  export async function removeFromBasket(username: string, productID: string) {
    let doc = await Products.getProductByID(productID);
    if (!doc) {
      return 'product ID ' + productID + ' doesn\'t exist';
    }
    return (await userModel
                .updateOne(
                    {
                      _id: username,
                    },
                    {$pull: {basket: {'productID': productID}}})
                .exec());
  }

  export async function getBasketSum(username: string) {
    let user = await getUser(username, true);


    let agg = await userModel.aggregate(

      [{$match: {_id:username}},
        {$unwind : {path: '$basket', preserveNullAndEmptyArrays: true}},
        {
          $lookup:{
          from: 'products',
          localField: 'basket.productID',
          foreignField : '_id',
          as: 'products'
        }
      },
      {
        $project: {product:{$arrayElemAt : ['$products', 0]}, quantity :'$basket.quantity'}
      },
      {
        $project: {
          'finalPrice' : {
          $multiply : ['$product.price', '$quantity']
        }}
      }
      ,{
        $group :{
          _id: null,
          sum:{$sum: '$finalPrice'}
        }
      }
    ]);
    return agg && agg[0].sum;
  }

  export function updateUserById(username: string, user: Partial<User>):
      Promise<User> {
    user = stripObject(user, userPermitedFields);
    return new Promise((resolve, reject) => {
      userModel.findByIdAndUpdate(
          username, {$set: user}, (err: Error, oldUser: User) => {
            if (err) {
              reject(err);
              return;
            }
            // sending back the new one
            resolve(Object.assign([], oldUser, user));
          });
    });
  }
  export async function addUser(user: User): Promise<User> {
    user = stripObject(user, userPermitedFields.concat(['_id']));
    let userDoc: any = new userModel(user);
    return await userDoc.save();
  }
  export async function deleteUser(userID: string, adminID?: string):
      Promise<User> {
    // verify that it's an admin if needed
    if (adminID) {
      let admin: User = (await userModel.findById(adminID)).toObject();
      if (admin.userType !== UserType.Admin) {
        throw 'You\'re not the admin';
      }
    }
    return await userModel.findByIdAndRemove(userID);
  }
  export async function getCount() {
    return await userModel.estimatedDocumentCount().exec();
  }
  export async function getIDs() {
    return await userModel.find().select('_id');
  }
}