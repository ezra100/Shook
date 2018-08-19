import * as mongoose from 'mongoose';
import {Aggregate, Model, NativeError} from 'mongoose';

import {helpers} from '../../helpers';
import {Category, Chat, DMessage, Gender, IComment, Product, Review, User, UserAuthData, UserType} from '../../types';
import {chatRoomPermitedFields, commentPermitedFields, productPermitedFields, reviewPermitedFields, stripObject, userPermitedFields} from '../helpers';
import {Schema} from '../helpers';

import {Users} from './users';

let DMessageSchema = new Schema({
  from: {type: String, ref: 'User', index: true, required: true},
  to: {type: String, ref: 'User', index: true, required: true},
  content: String,
  date: {type: Date, default: Date.now}
});

export let DMessageModel = mongoose.model('DMessage', DMessageSchema);

export namespace DirectMessages {

  export async function addDMessage(
      message: DMessage,
      verifyTo /* whether to verify the 'to' field or not*/: boolean = true) {
    if (verifyTo) {
      if (!message.to) {
        throw '"to" field not specified';
      }
      let toUser = await Users.getUser(message.to);
      if (!toUser) {
        throw message.to + ' isn\'t a username';
      }
    }
    let doc = await DMessageModel.create(message);
    return doc && doc.toObject();
  }

  // get all messages between 2 users
  export async function
  getChat(user: string, otherUser: string, offset: number = 0, limit?: number) {
    let query =
        DMessageModel
            .find({
              $or: [{from: user, to: otherUser}, {from: otherUser, to: user}]
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
      user: await Users.getUser(otherUser)
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
            'user.imageURL': 1
          }
        }
      ]);
    return await query;
  }
  export async function getIDs(){
    return await DMessageModel.find().select('_id');
  }
  export async function getCount() {
    return await DMessageModel.estimatedDocumentCount().exec();
  }
}