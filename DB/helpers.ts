
export let userPermitedFields = [
  'firstName',
  'lastName',
  'email',
  'gender',
  'address',
  'imageURL',
];

export let productPermitedFields = [
  'title',
  'subtitle',
  'link?',
  'price',
];

export let reviewPermitedFields = [
  'title',
  'fullReview',
  'rating',
];

export let commentPermitedFields = ['comment'];

export let messagePermitedFields = ['content'];

export let chatRoomPermitedFields = ['name', 'admins'];

export function stripObject(object: any, permitedFields: string[]): any {
  let newObj: any = {};
  for (let field of permitedFields) {
    if (object[field] !== undefined && object[field] !== null) {
      newObj[field] = object[field];
    }
  }
  return newObj;
}

import * as mongoose from 'mongoose';
import {Aggregate, Model, NativeError} from 'mongoose';

import {helpers} from '../helpers';
import {Category, Gender, IComment, Review, User, UserAuthData, UserType} from '../types';

// set up default mongoose connection
var connectionString: string = 'mongodb://127.0.0.1/shook';
mongoose.connect(connectionString);

// get the default connection
export var mongoConnection: mongoose.Connection = mongoose.connection;



// bind connection to error event (to get notification of connection errors)
mongoConnection.on(
    'error', console.error.bind(console, 'MongoDB connection error:'));



// define a schema
// let Schema: any = mongoose.Schema;

export class Schema extends mongoose.Schema {
  preAnyUpdate(func: mongoose.HookSyncCallback<mongoose.Query<any>>): void {
    this.pre('update', func);
    this.pre('updateOne', func);
    this.pre(
        'updateMany', func);  // not sure this will work well, since it's many
    this.pre('findOneAndUpdate', func)
  }
  postAnyFInd<T extends Document>(
      fn: (doc: mongoose.Document, next: (err?: NativeError) => void) => void):
      this {
    this.post('findOne', fn);
    this.post(
        'find',
        function(docs: mongoose.Document, next: (err?: NativeError) => void) {
          Array.prototype.forEach.call(
              docs, (doc: mongoose.Document) => fn(doc, () => {}));
          next();
        });
    return this;
  }
}
