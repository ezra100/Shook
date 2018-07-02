"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker = require("faker");
const fs = require("fs");
const path = require("path");
const auth_1 = require("../auth/auth");
const types_1 = require("../types");
const MongoDB_1 = require("./MongoDB");
let users;
let products;
let reviews;
let comments;
const logFile = path.join(__dirname, 'password.log');
function generateUser() {
    let firstName = faker.name.firstName();
    let lastName = faker.name.lastName();
    let username = faker.internet.userName(firstName, lastName);
    let password = faker.internet.password();
    let user = {
        userType: faker.random.number(20) > 19 ? types_1.UserType.Admin : types_1.UserType.Basic,
        firstName,
        lastName,
        _id: username,
        address: faker.address.streetAddress() + ', ' + faker.address.city() +
            ', ' + faker.address.country(),
        email: faker.internet.email(),
        gender: faker.random.boolean ? types_1.Gender.Male : types_1.Gender.Female,
        imageURL: '/img/default.png',
        follows: []
    };
    return { user, password: password };
}
function getFakeUsers(num) {
    let arr = [];
    for (let i = 0; i < num; i++) {
        arr.push(generateUser());
    }
    return arr;
}
function getFakeProduct() {
    return {
        title: faker.lorem.sentence(),
        subtitle: faker.lorem.paragraph(),
        link: faker.internet.url(),
        owner: users[faker.random.number(users.length - 1)]._id,
        creationDate: faker.date.past(5),
    };
}
function getRandomUsernames(min = 5, max = 30) {
    max = Math.max(max, users.length / 8);
    let likesSize = faker.random.number({ min, max });
    let dislikesSize = faker.random.number({ min, max });
    let likes = [];
    let dislikes = [];
    let usernames = users.map(user => user._id.toLowerCase());
    while (likes.length < likesSize) {
        likes.push(usernames.splice(faker.random.number(usernames.length - 1), 1)[0]);
    }
    while (dislikes.length < dislikesSize) {
        dislikes.push(usernames.splice(faker.random.number(usernames.length - 1), 1)[0]);
    }
    return [likes, dislikes];
}
function getFakeReview() {
    let likeDislike = getRandomUsernames();
    let product = products[faker.random.number(products.length - 1)];
    return {
        owner: users[faker.random.number(users.length - 1)]._id,
        title: faker.lorem.sentence(), fullReview: faker.lorem.paragraphs(3),
        dislikes: likeDislike[1], likes: likeDislike[0],
        rating: faker.random.number({ min: 1, max: 5 }),
        productID: product._id,
        creationDate: faker.date.between(product.creationDate, Date()),
    };
}
function getFakeComment() {
    let likeDislike = getRandomUsernames();
    let review = reviews[faker.random.number(reviews.length - 1)];
    return {
        owner: users[faker.random.number(users.length - 1)]._id,
        comment: faker.lorem.paragraphs(3), dislikes: likeDislike[1],
        likes: likeDislike[0],
        reviewID: review._id,
        creationDate: faker.date.between(review.creationDate, Date()),
    };
}
function initProducts(size = 1500) {
    return __awaiter(this, void 0, void 0, function* () {
        let users = yield MongoDB_1.db.getUsers();
        for (let i = 0; i < size; i++) {
            MongoDB_1.db.addProduct(getFakeProduct(), false);
        }
    });
}
function initUsers(size = 50, logPasswod = true) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let pack of getFakeUsers(size)) {
            MongoDB_1.db.addUser(pack.user);
            yield auth_1.createUserData(pack.user._id, pack.password);
            // log
            if (logPasswod) {
                let logText = pack.user._id + ' : ' + pack.password + '\n';
                fs.appendFile(logFile, logText, function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        }
    });
}
function initDB(usersSize = 100, avgProductsPerUser = 5, reviewsPerProduct = 5, commentsPerReview = 8) {
    return __awaiter(this, void 0, void 0, function* () {
        users = yield MongoDB_1.db.getUsers();
        products = yield MongoDB_1.db.getLatestProducts();
        reviews = yield MongoDB_1.db.getLatestReviews();
        comments = yield MongoDB_1.db.getLatestComments();
        if (users.length < usersSize) {
            yield initUsers(usersSize - users.length);
            users = yield MongoDB_1.db.getUsers();
        }
        if (products.length < usersSize * avgProductsPerUser) {
            yield initProducts((usersSize * avgProductsPerUser) - products.length);
            products = yield MongoDB_1.db.getLatestProducts();
        }
        if (reviews.length < products.length * reviewsPerProduct) {
            for (let i = reviews.length; i < products.length * reviewsPerProduct; i++) {
                yield MongoDB_1.db.addReview(getFakeReview(), false);
            }
            reviews = yield MongoDB_1.db.getLatestReviews();
        }
        if (comments.length < reviews.length * commentsPerReview) {
            for (let i = comments.length; i < reviews.length * commentsPerReview; i++) {
                yield MongoDB_1.db.addComment(getFakeComment(), false);
            }
            comments = yield MongoDB_1.db.getLatestComments();
        }
    });
}
exports.initDB = initDB;
//# sourceMappingURL=data-generator.js.map