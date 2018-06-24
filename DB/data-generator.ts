

import * as faker from 'faker';
import * as fs from 'fs';
import * as path from 'path';
import {Gender, User, UserAuthData} from '../types';

const logFile: string = path.join(__dirname, 'password.log');
interface IInitPackage {
  user: User;
  userData: UserAuthData;
  password: string;
}


function generateUser(logPasswod: boolean = true): IInitPackage {
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
  let userData: UserAuthData = {username};
  if (logPasswod) {
    let logText = username + ' : ' + password + '\n';
    fs.appendFile(logFile, logText, function(err) {
      if (err) {
        console.error(err);
      }
    });
  }
  return {user, userData, password: password};
}

function getFakeUsers(num : number, logPasswod :boolean = true) : IInitPackage[]{
  let arr :IInitPackage[] = [];
  for(let i = 0; i < num; i++){
    arr.push(generateUser(logPasswod));
  }
  return arr;
}

export function initDB(usersSize : number = 50){
  for(let pack of getFakeUsers(usersSize)){
    
  }
}
