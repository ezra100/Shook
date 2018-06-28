import * as mongoose from 'mongoose';
import {Aggregate, Model, NativeError} from 'mongoose';

import {helpers} from '../helpers';
import {Gender, User, UserAuthData, UserType} from '../types';


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
    this.post('find', fn);
    this.post('findOne', fn);
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
  username: {
    type: String,
    required: [
      function() {
        // username must be at least 6 letters, and english alphabet, underscore
        // and number only
        return /^[a-zA-Z0-9_]{6,}$/.test(this.username);
      },
      'username must be at least 6 characters. English alphabet, underscore and numbers only'
    ]
  },  // key/id field
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
});

let userDataSchema: Schema = new Schema({
  _id: String,
  username: {
    type: String,
    required: [
      function() {
        // username must be at least 6 letters, and english alphabet, underscore
        // and number only
        return /^[a-zA-Z0-9_]{6,}$/.test(this.username);
      },
      'username must be at least 6 characters. English alphabet, underscore and numbers only'
    ]
  },  // key/id field
  recoveryKey: String,
  recoveryCreationDate: Date,
  salt: {type: String, required: true},
  hashedPassword: {type: String, required: true},
});
userDataSchema.pre('save', function(next: Function): void {
  this._id = (<any>this).username.toLowerCase();
  next();
});
userSchema.pre('save', function(next: Function): void {
  this._id = (<any>this).username.toLowerCase();
  next();
});
userSchema.preAnyUpdate(function(next: Function): void {
  delete this.getUpdate().username;
  next();
});



let productSchema: Schema = new Schema({
  _id: {type: mongoose.Schema.Types.ObjectId, required: true},
  creationDate: { type: Date, default: Date.now },
  title: {type: String, required: true, minlength: 6, maxlength: 140},
  subtitle: {type: String, required: true},
  username: {type: String, required: true, ref: 'User'},
  link: {
    type: String,
    required: function() {
      return !this.link || helpers.isValidURL(this.link)
    }
  },
});


let reviewSchema = new Schema({
  _id: {type: Schema.Types.ObjectId, required: true},
  creationDate: { type: Date, default: Date.now },
  username: {type: String, required: true, ref: 'User'},
  productID: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },  // product._id
  title: {type: String, required: true, minlength: 5, maxlength: 140},
  fullReview: {type: String, required: true},
  rating: {type: Number, min: 1, max: 5},  // 1-5 stars
  helpful: [{type: String, required: true}],
  notHelpful: [{type: String, required: true}],
  // helpful and notHelpful must not intersect, must not have duplicates, and
  // usernames must exist
});



let commentSchema = new Schema({
  _id: {type: mongoose.Schema.Types.ObjectId, required: true},
  username: {type: String, required: true, ref: 'User'},
  creationDate: { type: Date, default: Date.now },
  reviewID: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },  // review._id
  comment: {type: String, minlength: 1, required: true},
  likes: [{
    type: String,
    required: true
  }],  // array of usernames of those who liked the comment
  dislike: [{type: String, required: true}],  // array of username of dislikes
})


//#region hooks
productSchema.preAnyUpdate(function(next: Function) {
  delete this.getUpdate().username;
  next();
});
productSchema.pre('save', function(next: Function): void {
  if (typeof this._id === 'string') {
    this._id = new mongoose.Schema.Types.ObjectId(this._id);
  }
  next();
});
productSchema.postAnyFInd(function(
    doc: mongoose.Document, next: Function): void {
  console.log(doc);
  next();
});



reviewSchema.preAnyUpdate(function(next: Function): void {
  delete this.getUpdate().productID;  // don't change the product id
  delete this.getUpdate().username;

  next();
});
reviewSchema.pre('save', function(next: Function): void {
  if (typeof this._id === 'string') {
    this._id = new mongoose.Schema.Types.ObjectId(this._id);
  }
  let th : any = this;
  if (typeof th.productID === 'string') {
    th.productID = new mongoose.Schema.Types.ObjectId(th.productID);
  }
  next();
});
reviewSchema.postAnyFInd(function(doc, next: Function): void {
  this._id = this._id.toString();
  this.productID = this.productID.toString(); 
  next();
});



commentSchema.pre('save', function(next: Function): void {
  if (typeof this._id === 'string') {
    this._id = new mongoose.Schema.Types.ObjectId(this._id);
  }
  let th : any = this;
  if (typeof th.reviewID === 'string') {
    th.reviewID = new mongoose.Schema.Types.ObjectId(th.reviewID);
  }
  next();
});
commentSchema.preAnyUpdate(function(next: Function): void {
  delete (<any>this).reviewID;  // prevent changing the review id
  delete (<any>this).username;  // prevent changing the username
  next();
});

commentSchema.postAnyFInd(function(doc, next: Function): void {
  console.log(doc);
  next();
});


//#endregion

export let userModel: mongoose.Model<any> = mongoose.model('User', userSchema);
export let userAuthDataModel: mongoose.Model<any> =
    mongoose.model('UserData', userDataSchema);

export let productModel = mongoose.model('Product', productSchema);
export let reviewModel = mongoose.model('Review', reviewSchema);
export let commentModel = mongoose.model('Comment', commentSchema);
