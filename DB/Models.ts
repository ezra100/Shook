import * as mongoose from 'mongoose';
import {Aggregate, Model, NativeError} from 'mongoose';

import {helpers} from '../helpers';
import {Gender, IComment, IReview, User, UserAuthData, UserType} from '../types';


// define a schema
// let Schema: any = mongoose.Schema;

class Schema extends mongoose.Schema {
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
  basket: [{type: Schema.Types.ObjectId, ref: 'Product', required: true}]
});

let userDataSchema: Schema = new Schema({
  _id: String,
  recoveryKey: String,
  recoveryCreationDate: Date,
  salt: {type: String, required: true},
  hashedPassword: {type: String, required: true},
});
userDataSchema.pre('save', function(next: Function): void {
  this._id = this._id.toLowerCase();
  next();
});
userSchema.pre('save', function(next: Function): void {
  this._id = this._id.toLowerCase();
  next();
});



let productSchema: Schema = new Schema({
  creationDate: {type: Date, default: Date.now, index: true},
  title: {type: String, required: true, minlength: 6, maxlength: 140},
  subtitle: {type: String, required: true},
  owner: {type: String, required: true, ref: 'User'},
  link: {
    type: String,
    required: function() {
      return !this.link || helpers.isValidURL(this.link)
    }
  },
  price: {type: Number, required: true}
});


let reviewSchema = new Schema({
  creationDate: {type: Date, default: Date.now, index: true},
  owner: {type: String, required: true, ref: 'User'},
  productID: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },  // product._id
  title: {type: String, required: true, minlength: 5, maxlength: 140},
  fullReview: {type: String, required: true},
  rating: {type: Number, min: 1, max: 5},  // 1-5 stars
  likes: [{type: String, required: true, ref: 'User'}],

  // the count is for cases when the likes array is spliced (for optimization)
  // it isn't required for insertion, but supposed to created in the post find
  // hooks
  likesCount: Number,
  dislikes: [{type: String, required: true, ref: 'User'}],
  dislikesCount: Number,

});



let commentSchema = new Schema({
  owner: {type: String, required: true, ref: 'User'},
  creationDate: {type: Date, default: Date.now, index: true},
  reviewID: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },  // review._id
  comment: {type: String, minlength: 1, required: true},
  likes: [{
    type: String,
    required: true,
    ref: 'User'
  }],  // array of usernames of those who liked the comment
  likesCount: Number,

  dislikes: [{
    type: String,
    required: true,
    ref: 'User'
  }],  // array of username of dislikes
  dislikesCount: Number,

});


let chatRoomSchema = new Schema({
  _id: Number,
  name: {type: String, required: true},
  admins: [{type: String, required: true, ref: "User"}],
  owner : {type: String, required: true},
  last100Messages: [String]
});

let messageSchema = new Schema({
  _id: Number,
  roomID: {type: Number, ref:"ChatRoom"},
  content:{type: String, required: true}
});

//#region hooks


reviewSchema.postAnyFInd(function(doc, next: Function): void {
  let d: mongoose.Document&IReview = <any>doc;
  if (d.likes && d.dislikes) {
    d.likesCount = d.likes.length;
    d.dislikesCount = d.dislikes.length;
  }
  next();
});



commentSchema.postAnyFInd(function(doc, next: Function): void {
  let d: mongoose.Document&IComment = <any>doc;
  if (d.likes && d.dislikes) {
    d.likesCount = d.likes.length;
    d.dislikesCount = d.dislikes.length;
  }
  next();
});

productSchema.preAnyUpdate(function(next: Function): void {
  let update: any = this.getUpdate();
  delete update.owner;
  delete update.creationDate;

  next();
});
reviewSchema.preAnyUpdate(function(next: Function): void {
  let update: any = this.getUpdate();
  delete update.owner;
  delete update.creationDate;
  delete update.productID;

  next();
});
commentSchema.preAnyUpdate(function(next: Function): void {
  let update: any = this.getUpdate();
  delete update.owner;
  delete update.creationDate;
  delete update.reviewID;

  next();
});



//#endregion



export let userModel: mongoose.Model<any> = mongoose.model('User', userSchema);
export let userAuthDataModel: mongoose.Model<any> =
    mongoose.model('UserData', userDataSchema);

export let productModel = mongoose.model('Product', productSchema);
export let reviewModel = mongoose.model('Review', reviewSchema);
export let commentModel = mongoose.model('Comment', commentSchema);
export let chatRoomModel = mongoose.model("ChatRoom", chatRoomSchema);
export let messageModel = mongoose.model("Message", messageSchema);