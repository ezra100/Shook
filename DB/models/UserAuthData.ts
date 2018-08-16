import * as mongoose from 'mongoose';
import {Aggregate, Model, NativeError} from 'mongoose';

import {helpers} from '../../helpers';
import {UserAuthData} from '../../types';
import {Schema} from '../helpers';
import {chatRoomPermitedFields, commentPermitedFields, productPermitedFields, reviewPermitedFields, stripObject, userPermitedFields} from '../helpers';

let userAuthDataSchema: Schema = new Schema({
  _id: String,
  recoveryKey: String,
  recoverydate: Date,
  salt: {type: String, required: true},
  hashedPassword: {type: String, required: true},
});
userAuthDataSchema.pre('save', function(next: Function): void {
  this._id = this._id.toLowerCase();
  next();
});


export namespace UserAuth {
  export let userAuthDataModel: mongoose.Model<any> =
      mongoose.model('UserData', userAuthDataSchema);

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
}