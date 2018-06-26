

import * as faker from 'faker';
import * as fs from 'fs';
import * as path from 'path';
import {Gender, User, UserAuthData} from '../types';
import {db} from "./MongodDB";
import {createUserData} from "../auth/auth";
import { SSL_OP_LEGACY_SERVER_CONNECT } from 'constants';


const logFile: string = path.join(__dirname, 'password.log');
interface IInitPackage {
  user: User;
  password: string;
}


function generateUser(): IInitPackage {
  let firstName = faker.name.firstName();
  let lastName = faker.name.lastName();
  let username = faker.internet.userName(firstName, lastName);
  let password: string = faker.internet.password();
  let user: User = {
    firstName,
    lastName,
    username,
    address: faker.address.streetAddress() + ', ' + faker.address.city() +
        ', ' + faker.address.country(),
    email: faker.internet.email(),
    gender: faker.random.boolean ? Gender.Male : Gender.Female
  };

  return {user, password: password};
}

function getFakeUsers(num : number) : IInitPackage[]{
  let arr :IInitPackage[] = [];
  for(let i = 0; i < num; i++){
    arr.push(generateUser());
  }
  return arr;
}

export async function initDB(usersSize : number = 50, logPasswod: boolean = true){
  for(let pack of getFakeUsers(usersSize)){
    db.addUser(pack.user);
    createUserData(pack.user.username, pack.password);
    //log
    if (logPasswod) {
      let logText = pack.user.username + ' : ' + pack.password + '\n';
      fs.appendFile(logFile, logText, function(err) {
        if (err) {
          console.error(err);
        }
      });
    }
  }
}
