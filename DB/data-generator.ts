

import * as faker from 'faker';
import * as fs from 'fs';
import * as path from 'path';

import {createUserData} from '../auth/auth';
import {Category, ChatRoom, DMessage, Gender, IComment, Message, Product, Review, User, UserAuthData, UserType} from '../types';

import * as db from './Models';

let users: User[];
let products: Product[];
let reviews: Review[];
let chatRooms: ChatRoom[];

let usersLength: number;
let productsLength: number;
let reviewsLength: number;
let commentsLength: number;
let roomsLenght: number;
let messageLength: number;
let DMessageLength: number;

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
    userType: 4 - Math.floor(Math.sqrt(faker.random.number(15))),
    firstName,
    lastName,
    _id: username,
    address: faker.address.streetAddress() + ', ' + faker.address.city() +
        ', ' + faker.address.country(),
    email: faker.internet.email(),
    gender: faker.random.boolean ? Gender.Male : Gender.Female,
    imageURL: '/img/default.png',
    follows: [],
    basket: []
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

function getFakeProduct(): Partial<Product> {
  return {
    title: faker.commerce.productName(),
    subtitle: faker.lorem.paragraph(),
    link: faker.internet.url(),
    owner: users[faker.random.number(usersLength - 1)]._id,
    date: faker.date.past(5),
    price: faker.random.number({min: 5, max: 100, precision: 0.05}),
    category: faker.random.number(Category.Vehicles),
  };
}

function getRandomUsernamesArrays(
    min: number = 5, max: number = 30): [string[], string[]] {
  max = Math.max(max, usersLength / 8);
  let likesSize = faker.random.number({min, max});
  let dislikesSize = faker.random.number({min, max});
  let likes: string[] = [];
  let dislikes: string[] = [];

  let usernames = users.map(user => user._id.toLowerCase());
  while (likes.length < likesSize) {
    likes.push(
        usernames.splice(faker.random.number(usernames.length - 1), 1)[0]);
  }
  while (dislikes.length < dislikesSize) {
    dislikes.push(
        usernames.splice(faker.random.number(usernames.length - 1), 1)[0]);
  }
  return [likes, dislikes];
}

function getRandomUsernames(min: number = 5, max: number = 30): string[] {
  max = Math.max(max, usersLength / 8);
  let desiredSize = faker.random.number({min, max});
  let retUsernames: string[] = [];

  let usernames = users.map(user => user._id.toLowerCase());
  while (retUsernames.length < desiredSize) {
    retUsernames.push(
        usernames.splice(faker.random.number(usernames.length - 1), 1)[0]);
  }
  return retUsernames;
}

function getFakeReview(): Partial<Review> {
  let likeDislike = getRandomUsernamesArrays();
  let product = products[faker.random.number(productsLength - 1)];
  return {
    owner: users[faker.random.number(usersLength - 1)]._id,
        title: faker.lorem.sentence(), fullReview: faker.lorem.paragraphs(3),
        dislikes: likeDislike[1], likes: likeDislike[0],
        rating: faker.random.number({min: 1, max: 5}), productID: product._id,
        date: faker.date.between(product.date, Date()),
  }
}

function getFakeComment(): Partial<IComment> {
  let likeDislike = getRandomUsernamesArrays();
  let product = products[faker.random.number(reviewsLength - 1)];
  return {
    owner: users[faker.random.number(usersLength - 1)]._id,
        comment: faker.lorem.paragraphs(3), dislikes: likeDislike[1],
        likes: likeDislike[0], productID: product._id,
        date: faker.date.between(product.date, Date()),
  }
}

function getFakeDMessage() {
  let from = users[faker.random.number(users.length - 1)]._id;
  let to = users[faker.random.number(users.length - 1)]._id;
  while (to === from) {
    to = users[faker.random.number(users.length - 1)]._id;
  }
  let dMessage: DMessage = {
    content: faker.lorem.sentences(faker.random.number({min: 1, max: 7})),
    date: faker.date.past(3),
    from,
    to
  };
  return dMessage;
}

function getFakeMessage(members: string[]) {
  return <Message>{
    content: faker.lorem.sentences(faker.random.number({min: 1, max: 7})),
    date: faker.date.past(3),
    from: members[faker.random.number(members.length - 1)]
  };
}

function getFakeChatRoom() {
  let members = getRandomUsernames(10, 90);
  let messages: Message[] = [];
  for (var i = 0; i < faker.random.number(50); i++) {
    messages.push(getFakeMessage(members));
  }
  return <ChatRoom>{
    members,
    admins: getRandomUsernames(0, 8),
    owner: users[faker.random.number(users.length - 1)]._id,
    name: faker.internet.userName(),
    messages
  };
}



async function initProducts(size: number = 1500) {
  for (let i = 0; i < size; i++) {
    db.Products.addProduct(getFakeProduct(), false);
  }
}


async function initUsers(size: number = 50, logPasswod: boolean = true) {
  for (let pack of getFakeUsers(size)) {
    db.Users.addUser(pack.user);
    await createUserData(pack.user._id, pack.password);
    // log
    if (logPasswod) {
      let logText = pack.user._id + ' : ' + pack.password + '\n';
      fs.appendFile(logFile, logText, function(err) {
        if (err) {
          console.error(err);
        }
      });
    }
  }
}


export async function initDB(
    usersSizeGoal: number = 100, avgProductsPerUser = 5,
    reviewsPerProduct: number = 5, requiredChatRooms: number = 100,
    DMessagePerUser = 300) {
  usersLength = await db.Users.getCount();
  productsLength = await db.Products.getCount();
  reviewsLength = await db.Reviews.getCount();
  roomsLenght = await db.ChatRooms.getCount();
  DMessageLength = await db.DirectMessages.getCount();
  users = await db.Users.getIDs();

  if (usersLength < usersSizeGoal) {
    await initUsers(usersSizeGoal - usersLength);
    usersLength = await db.Users.getCount();
  }
  if (productsLength < usersSizeGoal * avgProductsPerUser) {
    await initProducts((usersSizeGoal * avgProductsPerUser) - productsLength);
    productsLength = await db.Products.getCount();
  }
  if (reviewsLength < productsLength * reviewsPerProduct) {
    products = await db.Products.getIDs();
    for (let i = reviewsLength; i < productsLength * reviewsPerProduct; i++) {
      await db.Reviews.addReview(<Review>getFakeReview(), false);
    }
    reviewsLength = await db.Reviews.getCount();
  }
  if (roomsLenght < requiredChatRooms) {
    for (; roomsLenght < requiredChatRooms; roomsLenght++) {
      let room = getFakeChatRoom();
      await db.ChatRooms.addChatRoom(room.name, room.owner, room.admins);
    }
  }
  if (DMessageLength < usersLength * DMessagePerUser) {
    for (; DMessageLength < usersLength * DMessagePerUser; DMessageLength++) {
      await db.DirectMessages.addDMessage(getFakeDMessage(), false);
    }
  }
}
