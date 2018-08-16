import {resolve} from 'dns';
import * as faker from 'faker';
// import the mongoose module
import * as mongoose from 'mongoose';

import {helpers} from '../helpers';
import {Category, Chat, ChatRoom, DMessage, Gender, IComment, Message, Order, Product, Review, User, UserAuthData, UserType} from '../types';

import {chatRoomPermitedFields, commentPermitedFields, productPermitedFields, reviewPermitedFields, stripObject, userPermitedFields} from './helpers';
import {chatRoomModel, commentModel, DMessageModel, orderModel, productModel, reviewModel, userAuthDataModel, userModel} from './Models';

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
  export async function getUserAuthData(username: string):
      Promise<UserAuthData> {
    let doc = await userAuthDataModel.findById(username);
    return doc && doc.toObject();
  }

  export async function updateUserAuthData(
      username: string, data: Partial<UserAuthData>): Promise<void> {
    return await userAuthDataModel.findByIdAndUpdate(
        username, {$set: data}, {upsert: true});
  }
  export async function createUserAuthData(data: UserAuthData): Promise<void> {
    await userAuthDataModel.create(data);
  }



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
  //#region users
  // todo: update this
  export async function getUsers(
      filter: any = {}, offset: number = 0, limit?: number,
      showPrivateData: boolean = false): Promise<User[]> {
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
  export async function
  getUser(username: string, showPrivateData: boolean = false):
      Promise<Partial<User>> {
    let query = userModel.findById(username.toLowerCase());
    if (!showPrivateData) {
      query.select('_id firstName lastName gender userType imageUrl');
    }
    let doc = await query;
    return doc && doc.toObject();
  }

  export async function
  getUsersList(filter: any = {}, limit?: number, skip?: number) {
    let query = userModel.find(filter).select(
        '_id firstName lastName gender userType imageUrl');
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
    let doc = await getProductByID(productID);
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
    let doc = await getProductByID(productID);
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
  //#endregion
  //#region  product
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
      deleteReviewsByProductID(id);
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
    let user = await userModel.findById(username);
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
  //#endregion

  //#region review
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
  export async function
  deleteReview(id: string, removeComments: boolean = true) {
    if (removeComments) {
      deleteCommentsByProductID(id);
    }
    let doc = await reviewModel.findByIdAndRemove(id);
    return doc && doc.toObject();
  }
  export async function deleteReviewsByProductID(productID: string) {
    let reviews = await getLatestReviews({productID: productID});
    reviews.forEach((review) => {
      deleteCommentsByProductID(review._id);
    });
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

  export async function getProductRating(productID: string): Promise<number> {
    return (await reviewModel.aggregate()
                .match({productID: mongoose.Types.ObjectId(productID)})
                .group({_id: '$productID', avg: {$avg: '$rating'}}))[0]
        .avg;
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
    let userDoc = (await userModel.findById(username));
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
  //#endregion

  //#region comment
  export async function addComment(comment: IComment, secure: boolean = true):
      Promise<IComment> {
    if (secure) {
      comment.date = new Date();
      comment.dislikes = [];
      comment.likes = [];
    }
    return (await commentModel.create(comment)).toObject();
  }
  export async function deleteComment(id: string) {
    commentModel.findByIdAndRemove(id);
  }
  export async function deleteCommentsByProductID(productID: string) {
    let results =
        await commentModel.remove({productID: new ObjectId(productID)});
    return results;
  }
  export async function
  updateComment(comment: Partial<IComment>, owner: string): Promise<IComment> {
    comment = stripObject(comment, commentPermitedFields);
    return (await commentModel.findOneAndUpdate(
                {_id: comment._id, owner: owner || 'block undefined'},
                {$set: comment}, {new: /* return the new document*/ true}))
        .toObject();
  }
  export async function getCommentByID(id: string): Promise<IComment> {
    let doc = (await commentModel.findById(id));
    return doc && doc.toObject();
  }
  export async function getLatestComments(
      filter: Partial<IComment> = {}, offset: number = 0,
      limit?: number): Promise<IComment[]> {
    let res = commentModel.find(filter).sort('-date').skip(offset);
    if (limit) {
      res.limit(limit);
    }
    return (await res.exec()).map(doc => doc.toObject());
  }

  export async function likeComment(id: string, username: string) {
    return (await commentModel
                .update(
                    {_id: id},
                    {$addToSet: {likes: username}, $pull: {dislikes: username}})
                .exec());
  }
  export async function dislikeComment(id: string, username: string) {
    return await commentModel
        .update(
            {_id: id},
            {$pull: {likes: username}, $addToSet: {dislikes: username}})
        .exec();
  }
  export async function
  removeLikeDislikeFromComment(id: string, username: string) {
    return await commentModel
        .update({_id: id}, {$pull: {likes: username, dislikes: username}})
        .exec();
  }

  //#endregion

  //#region chat

  export namespace ChatRooms {
    export async function getRoomsSize() {
      return await chatRoomModel.estimatedDocumentCount().exec();
    }

    export async function addChatRoom(
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

    export async function
    updateRoom(id: number, owner: string, chatRoom: Partial<ChatRoom>) {
      chatRoom = stripObject(chatRoom, chatRoomPermitedFields);
      let doc = await chatRoomModel.findOneAndUpdate(
          {_id: id, owner: owner}, {$set: chatRoom}, {new: true});
      return doc && doc.toObject();
    }


    export async function getRooms(filter: any = {}): Promise<ChatRoom[]> {
      return (await chatRoomModel.find(filter)).map(d => d.toObject());
    }
    export async function getRoomByID(roomID: string): Promise<ChatRoom> {
      return (await chatRoomModel.findById(roomID)).toObject();
    }
    export async function
    addMember(member: string, adminName: string, roomID: string) {
      if (!await getUser(member)) {
        throw member + ' doesn\'t exist';
      }
      return await chatRoomModel.updateOne(
          {
            _id: roomID,
            admins:
                /* maek sure the given admin is actually an admin of that room*/
                {$elemMatch: adminName}
          },
          {$addToSet: {members: member}, $pull: {memberRequests: member}});
    }
    export async function
    removeMember(member: string, adminName: string, roomID: string) {
      return await chatRoomModel.updateOne(
          {_id: roomID, admins: {$elemMatch: adminName}},
          {$pull: {members: member}});
    }



    export async function
    addAdmin(admin: string, roomOwnerName: string, roomID: string) {
      if (!await getUser(admin)) {
        throw admin + ' doesn\'t exist';
      }
      await addMember(admin, roomOwnerName, roomID);
      return await chatRoomModel.updateOne(
          {
            _id: roomID,
            owner: /* maek sure the given owner name is actually the owner of
                      that room*/
                roomOwnerName
          },
          {$addToSet: {admins: admin}});
    }
    export async function
    removeAdmin(admin: string, roomOwnerName: string, roomID: string) {
      if (admin === roomOwnerName) {
        throw 'the owner cannot remove itself from the admin list';
      }
      return await chatRoomModel.updateOne(
          {_id: roomID, owner: roomOwnerName}, {$pull: {admins: admin}});
    }

    export async function getGroupsWhereUserMemberOf(username: string) {
      return await chatRoomModel.find({members: {$elemMatch: username}});
    }
    export async function getGroupsWhereUserIsAdmin(username: string) {
      return await chatRoomModel.find({admins: {$elemMatch: username}});
    }
    export async function getGroupsUserOwns(username: string) {
      return await chatRoomModel.find({owner: username});
    }

    export async function addMessage(
        message: Message, verifyMember: boolean = true): Promise<Message> {
      delete message._id;
      if (verifyMember) {
        let chat = await chatRoomModel.find(
            {_id: message.roomID, members: {$elemMatch: message.from}});
        if (!chat) {
          throw message.from + ' is not a member of this room';
        }
      }
      let queryResults = await chatRoomModel.updateOne(
          {_id: message.roomID}, {$push:{messages:message}});
      return queryResults && queryResults.toObject();
    }
    export async function deleteMessage(msg: Message, requesting: string) {
      let roomDoc = <mongoose.Document&ChatRoom>await chatRoomModel.findOne(
          {_id: msg._id});
      if (!roomDoc) {
        throw msg.roomID + ': room id doesn\'t exist';
      }
      let msgDoc = roomDoc.messages.find(m => m._id === msg._id);
      if (!msgDoc) {
        throw `Message with id ${msg._id} doesn't exists in room ${msg.roomID}`;
      }
      if (msgDoc.from === requesting ||
          roomDoc.admins.find(uID => uID === msg.from)) {
        return await chatRoomModel.update(
            {_id: roomDoc._id}, {$pull: {_id: msg._id}});
      } else {
        throw 'You\'re not authorized to delete this message';
      }
    }
    export async function
    getMessagesFromRoom(roomID: string, offset: number = 0, limit?: number) {
      let query = chatRoomModel.find({_id: roomID}).sort('-date').skip(offset);
      if (limit) {
        query.limit(limit);
      }
      return await query;
    }
  }

  export namespace DirectMessages {
    export async function getDMessageSize() {
      return await DMessageModel.estimatedDocumentCount().exec();
    }
    export async function addDMessage(
        message: DMessage,
        verifyTo /* whether to verify the 'to' field or not*/: boolean = true) {
      if (verifyTo) {
        if (!message.to) {
          throw '"to" field not specified';
        }
        let toUser = await getUser(message.to);
        if (!toUser) {
          throw message.to + ' isn\'t a username';
        }
      }
      let doc = await DMessageModel.create(message);
      return doc && doc.toObject();
    }

    // get all messages between 2 users
    export async function getChat(
        user: string, otherUser: string, offset: number = 0, limit?: number) {
      let query =
          DMessageModel
              .find({
                $or:
                    [{from: user, to: otherUser}, {from: otherUser, to: user}]
              })
              .sort('-date')
              .skip(offset);
      if (limit) {
        query.limit(limit);
      }
      let messages: DMessage[] = (<any[]>await query).reverse();

      return <Chat>{
        lastMessageDate:
            messages.length > 0 ? messages[messages.length - 1].date : null,
        messages,
        user: await getUser(otherUser)
      };
    }

    export async function getLastChats(
        user: string, offset: number = 0, limit: number = 100,
        dateOffset?: Date) {
      let query = DMessageModel.aggregate([
        {$match: {$or: [{from: user}, {to: user}]}},
        {$sort: {date: -1}}, {
          $addFields: {
            id: {
              $cond:
                  {if: {$eq: ['$from', user]}, then: '$to', else: '$from'}
            }
          }
        },
        {
          $group: {
            _id: '$id',
            messages: {$push: '$$ROOT'},
            lastMessageDate: {$max: '$date'},
            
          }
        },
        //if date offset is defined, then add this match to array aggregation
       ... dateOffset? [ {$match: {lastMessageDate: {$lt: dateOffset}}}] : []
        ,
        {$sort: {lastMessageDate: -1}}, {$limit: limit},
        {$lookup:{
          from: 'users', 
          localField: '_id',
          foreignField: '_id', 
          as: 'user'
        }},
        {
          '$unwind': '$user'
        },
        {
          '$project': {
            '_id': 1,
            'messages': { $reverseArray: '$messages' },
            'lastMessageDate': 1,
            'user._id': 1,
            'user.firstName': 1,
            'user.lastName': 1,
            'user.gender': 1,
            'user.userType' : 1,
            'user.imageUrl': 1
          }
        }
      ]);
      return await query;
    }
  }
  //#endregion
  export namespace orders {
    export async function addOrder(order: Order) {
      order.paid = false;
      let productIDList = order.products.map(p => p.productID);
      let productDocs =
          <any[]>await productModel.find({_id: {$in: productIDList}}).exec();
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
      return docs.map(doc => doc.toObject());
    }

    export async function markOrderAsPaid(orderID: string) {
      return await orderModel.updateOne({_id: orderID}, {$set: {paid: true}});
    }
  }


  //#region stats
  export async function getUsersSize() {
    return await userModel.estimatedDocumentCount().exec();
  }
  export async function getProductsSize() {
    return await productModel.estimatedDocumentCount().exec();
  }
  export async function getReviewsSize() {
    return await reviewModel.estimatedDocumentCount().exec();
  }
  export async function getCommentsSize() {
    return await commentModel.estimatedDocumentCount().exec();
  }


  //#endregion
}

function getUserKeyType(key: string): string {
  return (<string>(<any>userModel.schema).paths[key].instance).toLowerCase();
}
