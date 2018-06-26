"use strict";
// tslint:disable:typedef
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const session = require("express-session");
const path = require("path");
const auth = require("./auth/auth");
const passport_1 = require("./auth/passport");
const data_generator_1 = require("./DB/data-generator");
const users = require("./users/users");
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
// this must become before loginRouter
app.use(session({ secret }));
app.use(passport_1.passport.initialize());
app.use(passport_1.passport.session());
app.use('/auth', auth.router);
app.use('/users', users.router);
app.use('/', express.static(path.join(__dirname, 'public')));
// server favicon
app.get('/favicon.ico', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/img/favicon.jpg'));
});
exports.default = app;
//# sourceMappingURL=app.js.map