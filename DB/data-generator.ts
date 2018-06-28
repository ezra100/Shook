

import * as faker from 'faker';
import * as fs from 'fs';
import * as path from 'path';

import {createUserData} from '../auth/auth';
import {Gender, IMinProduct, IProduct, User, UserAuthData, UserType} from '../types';

import {db} from './MongoDB';


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
    userType: faker.random.number(20) > 19 ? UserType.Admin : UserType.Basic,
    firstName,
    lastName,
    username,
    address: faker.address.streetAddress() + ', ' + faker.address.city() +
        ', ' + faker.address.country(),
    email: faker.internet.email(),
    gender: faker.random.boolean ? Gender.Male : Gender.Female,
    imageURL: '/img/default.png'
  };

  return {user, password: password};
}

function getFakeUsers(num: number): IInitPackage[] {
  let arr: IInitPackage[] = [];
  for (let i = 0; i < num; i++) {
    arr.push(generateUser());
  }
  return arr;
}

function getFakeProduct(users: User[]): IMinProduct {
  return {
    title: faker.lorem.sentence(),
    subtitle: faker.lorem.paragraph(),
    link: faker.internet.url(),
    username: users[faker.random.number(users.length - 1)].username
  };
}

async function initProducts(size: number = 1500) {
  let users = await db.getUsers();
  for (let i = 0; i < size; i++) {
    db.addProduct(getFakeProduct(users));
  }
}

export async function initDB(size: number = 50, logPasswod: boolean = true) {
  // for (let pack of getFakeUsers(size)) {
  //   db.addUser(pack.user);
  //   createUserData(pack.user.username, pack.password);
  //   // log
  //   if (logPasswod) {
  //     let logText = pack.user.username + ' : ' + pack.password + '\n';
  //     fs.appendFile(logFile, logText, function(err) {
  //       if (err) {
  //         console.error(err);
  //       }
  //     });
  //   }
  // }

  initProducts();
}
