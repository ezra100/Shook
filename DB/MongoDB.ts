import {resolve} from 'dns';
// import the mongoose module
import * as mongoose from 'mongoose';

import {helpers} from '../helpers';
import {ChatRoom, DMessage, Gender, IComment, IProduct, IReview, Message, User, UserAuthData, UserType} from '../types';

import {chatRoomModel, commentModel, DMessageModel, messageModel, productModel, reviewModel, userAuthDataModel, userModel} from './Models';
import {chatRoomPermitedFields, commentPermitedFields, productPermitedFields, reviewPermitedFields, stripObject, userPermitedFields} from './StripForUpdate';

let ObjectId = mongoose.Types.ObjectId;

// set up default mongoose connection
var connectionString: string = 'mongodb://127.0.0.1/shook';
mongoose.connect(connectionString);

// get the default connection
export var mongoConnection: mongoose.Connection = mongoose.connection;



// bind connection to error event (to get notification of connection errors)
mongoConnection.on(
    'error', console.error.bind(console, 'MongoDB connection error:'));

export namespace db {
  async  function getUserAuthData(username: string): Promise<UserAuthData> {
    let doc = await userAuthDataModel.findById(username);
    return doc && doc.toObject();
  }

  function updateUserAuthData(username: string, data: Partial<UserAuthData>):
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
  function createUserAuthData(data: UserAuthData): Promise<void> {
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



  async function findUserByEmail(email: string): Promise<User> {
    let doc = await userModel.findOne({email: email});
    return doc && doc.toObject();
  }

  //#region users
  // todo: update this
  async function getUsers(
      filter: any = {}, offset: number = 0, limit?: number,
      showPrivateData: boolean = false): Promise<User[]> {
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
    if (!showPrivateData) {
      query.select('_id firstName lastName gender userType imageUrl');
    }
    let users: User[] = await query;
    return users;
  }
  async function getUser(username: string, showPrivateData: boolean = false):
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



  async function addFollowee(follower: string, followee: string) {
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
  async function removeFollowee(follower: string, followee: string) {
    followee = followee.toLowerCase();
    follower = follower.toLowerCase();
    return (
        await userModel
            .update({_id: follower.toLowerCase()}, {$pull: {follows: followee}})
            .exec());
  }

  // todo
  async function addToBasket(username: string, productID: string, quantity: number = 1) {
    if (quantity < 1) {
      return await db.removeFromBasket(username, productID);
    }
    let doc = await this.getProductByID(productID);
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

  async function removeFromBasket(username: string, productID: string) {
    let doc = await this.getProductByID(productID);
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

  async function getBasketSum(username: string) {
    let user = await this.getUser(username, true);


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

  function updateUserById(username: string, user: Partial<User>): Promise<User> {
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
  function addUser(user: User): Promise<User|null> {
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
  function deleteUser(user: User): Promise<User|null> {
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
  async function addProduct(product: Partial<IProduct>, secure: boolean = true):
      Promise<IProduct> {
    if (secure) {
      product.creationDate = new Date();
    }
    let retProduct = await productModel.create(product);
    return retProduct && retProduct.toObject();
  }

  async function updateProduct(product: Partial<IProduct>, owner: string):
      Promise<IProduct|null> {
    product = stripObject(product, productPermitedFields);
    let doc = (await productModel.findOneAndUpdate(
        {_id: product._id, owner: owner || 'block undefined'}, product,
        {new /* return the new document*/: true}));
    return doc && doc.toObject();
  }
  async function deleteProduct(id: string, removeReviews: boolean = true) {
    if (removeReviews) {
      this.deleteReviewsByProductID(id);
    }
    let doc = await productModel.findByIdAndRemove(id);
    return doc && doc.toObject();
  }
  async function getProductByID(id: string): Promise<IProduct> {
    let doc = await productModel.findById(id);
    return doc && doc.toObject();
  }
  async function getLatestProducts(
      filter: Partial<IProduct> = {}, offset: number = 0,
      limit?: number): Promise<IProduct[]> {
    let res = productModel.find(filter).sort('-creationDate').skip(offset);
    if (limit) {
      res.limit(limit);
    }
    return (await res.exec()).map(doc => doc.toObject());
  }
  async function getProductsFromFollowees(
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
  async function addReview(review: IReview, secure: boolean = true): Promise<IReview> {
    if (secure) {
      review.dislikes = [];
      review.likes = [];
      review.creationDate = new Date();
    }
    let doc = await reviewModel.create(review);
    return doc && doc.toObject();
  }

  async function updateReview(review: Partial<IReview>, owner: string):
      Promise<IReview|null> {
    review = stripObject(review, reviewPermitedFields);
    let doc = await reviewModel.findOneAndUpdate(
        {_id: review._id, owner: owner || 'block undefined'}, review,
        {new /* return the new document*/: true});
    return doc && doc.toObject();
  }
  async function deleteReview(id: string, removeComments: boolean = true) {
    if (removeComments) {
      this.deleteCommentsByReviewID(id);
    }
    let doc = await reviewModel.findByIdAndRemove(id);
    return doc && doc.toObject();
  }
  async function deleteReviewsByProductID(productID: string) {
    let reviews = await this.getLatestReviews({productID: productID});
    reviews.forEach((review) => {
      this.deleteCommentsByReviewID(review._id);
    });
    let results =
        (await reviewModel.remove({productID: new ObjectId(productID)}));
    return results;
  }
  async function getReviewByID(id: string): Promise<IReview> {
    let doc = await reviewModel.findById(id);
    return doc && doc.toObject();
  }
  async function getLatestReviews(
      filter: Partial<IReview> = {}, offset: number = 0,
      limit?: number): Promise<IReview[]> {
    let res = reviewModel.find(filter).sort('-creationDate').skip(offset);
    if (limit) {
      res.limit(limit);
    }
    return (await res.exec()).map(doc => doc.toObject());
  }

  async function getProductRating(productID: string): Promise<number> {
    return (await reviewModel.aggregate()
                .match({productID: mongoose.Types.ObjectId(productID)})
                .group({_id: '$productID', avg: {$avg: '$rating'}}))[0]
        .avg;
  }
  async function likeReview(id: string, username: string) {
    return (await reviewModel
                .update(
                    {_id: id},
                    {$addToSet: {likes: username}, $pull: {dislikes: username}})
                .exec());
  }
  async function dislikeReview(id: string, username: string) {
    return await reviewModel
        .update(
            {_id: id},
            {$pull: {likes: username}, $addToSet: {dislikes: username}})
        .exec();
  }
  async function removeLikeDislikeFromReview(id: string, username: string) {
    return await reviewModel
        .update({_id: id}, {$pull: {likes: username, dislikes: username}})
        .exec();
  }

  async function getReviewsFromFollowees(
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
  async function addComment(comment: IComment, secure: boolean = true):
      Promise<IComment> {
    if (secure) {
      comment.creationDate = new Date();
      comment.dislikes = [];
      comment.likes = [];
    }
    return (await commentModel.create(comment)).toObject();
  }
  async function deleteComment(id: string) {
    commentModel.findByIdAndRemove(id);
  }
  async function deleteCommentsByReviewID(reviewID: string) {
    let results = await commentModel.remove({reviewID: new ObjectId(reviewID)});
    return results;
  }
  async function updateComment(comment: Partial<IComment>, owner: string):
      Promise<IComment|null> {
    comment = stripObject(comment, commentPermitedFields);
    return (await commentModel.findOneAndUpdate(
                {_id: comment._id, owner: owner || 'block undefined'}, comment,
                {new: /* return the new document*/ true}))
        .toObject();
  }
  async function getCommentByID(id: string): Promise<IComment> {
    let doc = (await commentModel.findById(id));
    return doc && doc.toObject();
  }
  async function getLatestComments(
      filter: Partial<IComment> = {}, offset: number = 0,
      limit?: number): Promise<IComment[]> {
    let res = commentModel.find(filter).sort('-creationDate').skip(offset);
    if (limit) {
      res.limit(limit);
    }
    return (await res.exec()).map(doc => doc.toObject());
  }

  async function likeComment(id: string, username: string) {
    return (await commentModel
                .update(
                    {_id: id},
                    {$addToSet: {likes: username}, $pull: {dislikes: username}})
                .exec());
  }
  async function dislikeComment(id: string, username: string) {
    return await commentModel
        .update(
            {_id: id},
            {$pull: {likes: username}, $addToSet: {dislikes: username}})
        .exec();
  }
  async function removeLikeDislikeFromComment(id: string, username: string) {
    return await commentModel
        .update({_id: id}, {$pull: {likes: username, dislikes: username}})
        .exec();
  }

  //#endregion

  //#region chat
  async function addChatRoom(
      name: string, owner: string, admins: string[],
      verifyAdmins: boolean = true) {
    admins.push(owner);
    // remove duplicates
    admins = [...new Set(admins)];

    if (verifyAdmins) {
      let adminsUsers = await userModel.find({_id: {$in: admins}}).exec();
      if (adminsUsers.length !== admins.length) {
        let verifiedAdmins: string[] = adminsUsers.map(user => user._id);
        let missingAdmins =
            admins.filter(name => verifiedAdmins.indexOf(name) === -1);
        throw 'the following admins don\'t exist: ' +
            JSON.stringify(missingAdmins);
      }
    }
    let room: Partial < ChatRoom >= {name, owner, admins, members: admins};
    let doc = await chatRoomModel.create(room);
    return doc && doc.toObject();
  }

  async function updateRoom(id: number, owner: string, chatRoom: Partial<ChatRoom>) {
    chatRoom = stripObject(chatRoom, chatRoomPermitedFields);
    let doc = await chatRoomModel.findOneAndUpdate(
        {_id: id, owner: owner}, chatRoom, {new: true});
    return doc && doc.toObject();
  }

  async function addMember(member: string, adminName: string, roomID: string) {
    if(!await this.getUser(member)){
      throw member + " doesn't exist";
    }
    return await chatRoomModel.updateOne(
        {_id: roomID, admins: /* maek sure the given admin is actually an admin of that room*/ {$elemMatch: adminName}},
        {$addToSet: {members: member}});
  }
  async function removeMember(member: string, adminName: string, roomID: string) {
    return await chatRoomModel.updateOne(
        {_id: roomID, admins: {$elemMatch: adminName}},
        {$pull: {members: member}});
  }



  async function addAdmin(admin: string, roomOwnerName: string, roomID: string) {
    if(!await this.getUser(admin)){
      throw admin + " doesn't exist";
    }
    await this.addMember(admin, roomOwnerName, roomID);
    return await chatRoomModel.updateOne(
        {_id: roomID, owner: /* maek sure the given owner name is actually the owner of that room*/ roomOwnerName},
        {$addToSet: {admins: admin}});
  }
  async function removeAdmin(admin: string, roomOwnerName: string, roomID: string) {
    if(admin === roomOwnerName){
      throw "the owner cannot remove itself from the admin list";
    }
    return await chatRoomModel.updateOne(
        {_id: roomID, owner: roomOwnerName},
        {$pull: {admins: admin}});
  }

  async function getGroupsWhereUserMemberOf(username:string){
    return await chatRoomModel.find({members:{$elemMatch: username}});
  }
  async function getGroupsWhereUserIsAdmin(username:string){
    return await chatRoomModel.find({admins:{$elemMatch: username}});
  }
  async function getGroupsUserOwns(username:string){
    return await chatRoomModel.find({owner:username});
  }


  async function addMessage(message: Message, verifyMember: boolean = true):
      Promise<Message> {
    delete message._id;
    if (verifyMember) {
      let chat = await chatRoomModel.find(
          {_id: message.roomID, members: {$elemMatch: message.owner}});
      if (!chat) {
        throw message.owner + ' is not a member of this room';
      }
    }
    let doc = await messageModel.create(message);
    return doc && doc.toObject();
  }
  async function deleteMessage(id: string, requesting: string) {
    let doc = await messageModel.findOneAndRemove({
      _id: id,
      '$or': [
        {owner: requesting},
        {owner: {$in: 'admins'}},
      ]
    });
    return doc && doc.toObject();
  }

  async function addDMessage(
      message: DMessage,
      verifyTo /* whether to verify the 'to' field or not*/: boolean = true) {
    if (verifyTo) {
      if (!message.to) {
        throw '"to" field not specified';
      }
      let toUser = await this.getUser(message.to);
      if (!toUser) {
        throw message.to + ' isn\'t a username';
      }
    }
    let doc = await DMessageModel.create(message);
    return doc && doc.toObject();
  }

  // get all messages between 2 users
  async function getDirectMessages(
      user1: string, user2: string, offset: number = 0, limit?: number) {
    let query =
        DMessageModel
            .find({$or: [{from: user1, to: user2}, {from: user2, to: user1}]})
            .sort('-date')
            .skip(offset);
    if (limit) {
      query.limit(limit);
    }
    return await query;
  }
  //#endregion



  //#region stats
  async function getUsersSize() {
    return await userModel.count({}).exec();
  }
  async function getProductsSize() {
    return await productModel.count({}).exec();
  }
  async function getReviewsSize() {
    return await reviewModel.count({}).exec();
  }
  async function getCommentsSize() {
    return await commentModel.count({}).exec();
  }
  async function getRoomsSize() {
    return await chatRoomModel.count({}).exec();
  }
  async function getMessagesSize() {
    return await messageModel.count({}).exec();
  }
  //#endregion
}

function getUserKeyType(key: string): string {
  return (<string>(<any>userModel.schema).paths[key].instance).toLowerCase();
}
