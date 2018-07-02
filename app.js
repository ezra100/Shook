"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const connMongo = require("connect-mongo");
const cookieParser = require("cookie-parser");
const express = require("express");
const session = require("express-session");
const path = require("path");
const auth = require("./auth/auth");
const passport_1 = require("./auth/passport");
const data_generator_1 = require("./DB/data-generator");
const MongoDB_1 = require("./DB/MongoDB");
const products = require("./products/products");
const users = require("./users/users");
const comments = require("./comments/comments");
const reviews = require("./reviews/reviews");
// init the data base with fake data
data_generator_1.initDB();
let secret = 'atgasdv82aergfnsg';
var app = express();
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
}));
app.use(cookieParser(secret));
let mongoStore = connMongo(session);
let options = { mongooseConnection: MongoDB_1.mongoConnection };
let store = new mongoStore(options);
app.use(session({ secret, store: store, resave: false, saveUninitialized: false }));
// this must become before loginRouter
app.use(passport_1.passport.initialize());
app.use(passport_1.passport.session());
app.use('/auth', auth.router);
app.use('/users', users.router);
app.use('/products', products.router);
app.use('/comments', comments.router);
app.use('/reviews', reviews.router);
app.use('/', express.static(path.join(__dirname, 'public')));
// server favicon
app.get('/favicon.ico', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/img/favicon.jpg'));
});
exports.default = app;
//# sourceMappingURL=app.js.map