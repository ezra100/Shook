

import * as faker from 'faker';
import * as fs from 'fs';
import * as path from 'path';

import {createUserData} from '../auth/auth';
import {Gender, IComment, IProduct, IReview, User, UserAuthData, UserType} from '../types';

import {db} from './MongoDB';

let users: User[];
let products: IProduct[];
let reviews: IReview[];

let usersLength: number;
let productsLength: number;
let reviewsLength: number;
let commentsLength: number;
let roomsLenght: number;
let messageLength: number;

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

function getFakeProduct(): Partial<IProduct> {
  return {
    title: faker.commerce.productName(),
    subtitle: faker.lorem.paragraph(),
    link: faker.internet.url(),
    owner: users[faker.random.number(usersLength - 1)]._id,
    creationDate: faker.date.past(5),
    price: faker.random.number({min: 5, max: 100, precision: 0.05}),
  };
}

function getRandomUsernames(
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

function getFakeReview(): Partial<IReview> {
  let likeDislike = getRandomUsernames();
  let product = products[faker.random.number(productsLength - 1)];
  return {
    owner: users[faker.random.number(usersLength - 1)]._id,
        title: faker.lorem.sentence(), fullReview: faker.lorem.paragraphs(3),
        dislikes: likeDislike[1], likes: likeDislike[0],
        rating: faker.random.number({min: 1, max: 5}), productID: product._id,
        creationDate: faker.date.between(product.creationDate, Date()),
  }
}

function getFakeComment(): Partial<IComment> {
  let likeDislike = getRandomUsernames();
  let review = reviews[faker.random.number(reviewsLength - 1)];
  return {
    owner: users[faker.random.number(usersLength - 1)]._id,
        comment: faker.lorem.paragraphs(3), dislikes: likeDislike[1],
        likes: likeDislike[0], reviewID: review._id,
        creationDate: faker.date.between(review.creationDate, Date()),
  }
}



async function initProducts(size: number = 1500) {
  for (let i = 0; i < size; i++) {
    db.addProduct(getFakeProduct(), false);
  }
}


async function initUsers(size: number = 50, logPasswod: boolean = true) {
  for (let pack of getFakeUsers(size)) {
    db.addUser(pack.user);
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
    reviewsPerProduct: number = 5, commentsPerReview = 8) {
  usersLength = await db.getUsersSize();
  productsLength = await db.getProductsSize();
  reviewsLength = await db.getProductsSize();
  commentsLength = await db.getCommentsSize();
  users = await db.getUsers();
  if (usersLength < usersSizeGoal) {
    await initUsers(usersSizeGoal - usersLength);
    usersLength = await db.getUsersSize();
  }
  if (productsLength < usersSizeGoal * avgProductsPerUser) {
    await initProducts((usersSizeGoal * avgProductsPerUser) - productsLength);
    productsLength = await db.getProductsSize();
  }
  if (reviewsLength < productsLength * reviewsPerProduct) {
    products = await db.getLatestProducts();
    for (let i = reviewsLength; i < productsLength * reviewsPerProduct; i++) {
      await db.addReview(<IReview>getFakeReview(), false);
    }
    reviewsLength = await db.getReviewsSize();
  }
  if (commentsLength < reviewsLength * commentsPerReview) {
    reviews = await db.getLatestReviews();
    for (let i = commentsLength; i < reviewsLength * commentsPerReview; i++) {
      await db.addComment(<IComment>getFakeComment(), false);
    }
    commentsLength = await db.getCommentsSize();
  }
}
