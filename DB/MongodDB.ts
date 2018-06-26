import {resolve} from 'dns';
// import the mongoose module
import * as mongoose from 'mongoose';

import {helpers} from '../helpers';
import {Gender, User, UserAuthData, UserType} from '../types';



// set up default mongoose connection
var connectionString: string = 'mongodb://127.0.0.1/shook';
mongoose.connect(connectionString);

// get the default connection
var mdb: mongoose.Connection = mongoose.connection;

//#region schema

// define a schema
let Schema: any = mongoose.Schema;



let userSchema: mongoose.Schema = new Schema({
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
    index: {unique: true},
    required: function() {
      return helpers.validateEmail(this.email)
    }
  },
  gender: {
    type: Number,
    required: function() {
      return this.gender in Gender;
    }
  },
  address: {type: String, required: true},
  imageURL: {type: String, required : function(){
    return helpers.isValidURL(this.imageURL)
  }},
});

let userDataSchema: mongoose.Schema = new Schema({
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
let userModel: mongoose.Model<any> = mongoose.model('User', userSchema);
let userDataModel: mongoose.Model<any> =
    mongoose.model('UserData', userDataSchema);


//#endregion



// bind connection to error event (to get notification of connection errors)
mdb.on('error', console.error.bind(console, 'MongoDB connection error:'));

class MongoDB {
  getUserAuthData(username: string): Promise<UserAuthData> {
    username = username.toLowerCase();
    return new Promise<UserAuthData>((resolve, reject) => {
      userDataModel.findById(username, (err: Error, data: UserAuthData) => {
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
      userDataModel.findByIdAndUpdate(
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
      userDataModel.create(data, (err: Error, rData: UserAuthData) => {
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
  findUser(username: string): Promise<User|null> {
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
    // prevent changing the username
    delete user.username;
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
}

function getUserKeyType(key: string): string {
  return (<string>(<any>userModel.schema).paths[key].instance).toLowerCase();
}


export var db: MongoDB = new MongoDB();