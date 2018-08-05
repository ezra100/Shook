import * as bodyParser from 'body-parser';
import * as connMongo from 'connect-mongo';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import {Request} from 'express';
import {Response} from 'express-serve-static-core';
import * as session from 'express-session';
import * as path from 'path';

import * as auth from './auth/auth';
import {passport} from './auth/passport';
import {initDB} from './DB/data-generator';
import {mongoConnection} from './DB/MongoDB';
import * as chatRooms from './routers/ChatRooms';
import * as comments from './routers/comments';
import * as DMessages from './routers/DMessages';
import * as products from './routers/products';
import * as reviews from './routers/reviews';
import * as users from './routers/users';

// init the data base with fake data
initDB();

let secret = 'atgasdv82aergfnsg';
var app = express();
app.use(bodyParser.json());  // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  // to support URL-encoded bodies
  extended: true
}));
app.use(cookieParser(secret));

let mongoStore = connMongo(session);
let options:
    connMongo.MogooseConnectionOptions = {mongooseConnection: mongoConnection};
let store = new mongoStore(options);
app.use(
    session({secret, store: store, resave: false, saveUninitialized: false}));

// this must become before loginRouter
app.use(passport.initialize());
app.use(passport.session());

// server favicon
app.use('*', function(req, res, next){
    console.log(Date(), req);
    next();
})
app.get('/favicon.ico', function(req: Request, res: Response) {
  res.sendFile(path.join(__dirname, 'public/img/robot.gif'));
});

app.use('/auth', auth.router);
app.use('/users', users.router);
app.use('/products', products.router);
app.use('/comments', comments.router);
app.use('/reviews', reviews.router);
app.use('/chatRooms', chatRooms.router);
app.use('/DMessages', DMessages.router);
// app.use('/', express.static(path.join(__dirname, 'public')));
// for main page and scripts
app.use(
    '/',
    express.static(path.join(__dirname, 'angular-app', 'dist', 'angular-app')));
// for routes of the angular app
app.use(
    '/*',
    express.static(path.join(__dirname, 'angular-app', 'dist', 'angular-app')));


export default app;