import * as bodyParser from 'body-parser';
import * as connMongo from 'connect-mongo';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import {Request} from 'express';
import {Response} from 'express-serve-static-core';
import * as session from 'express-session';
import * as https from 'https';
import * as path from 'path';

import * as auth from './auth/auth';
import {passport} from './auth/passport';
import {initDB} from './DB/data-generator';
import {mongoConnection} from './DB/MongoDB';
import * as morgan from './morgan';
import * as chatRooms from './routers/ChatRooms';
import * as comments from './routers/comments';
import * as DMessages from './routers/DMessages';
import * as products from './routers/products';
import * as reviews from './routers/reviews';
import * as users from './routers/users';
import * as io from './socket.io';

// init the data base with fake data
//initDB();

let secret = 'atgasdv82aergfnsg';
var app = express();
app.use(morgan.default);
app.use(bodyParser.json());  // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  // to support URL-encoded bodies
  extended: true
}));
let cp = cookieParser(secret);
app.use(cp);

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

app.get('/favicon.ico', function(req: Request, res: Response) {
  res.sendFile(path.join(__dirname, 'public/img/robot.gif'));
});

let apiRouter = express.Router();


apiRouter.use('/auth', auth.router);
apiRouter.use('/users', users.router);
apiRouter.use('/products', products.router);
apiRouter.use('/comments', comments.router);
apiRouter.use('/reviews', reviews.router);
apiRouter.use('/chatRooms', chatRooms.router);
apiRouter.use('/DMessages', DMessages.router);

app.use('/api', apiRouter);
app.use(
    '/',
    express.static(path.join(__dirname, 'angular-app', 'dist', 'angular-app')));
// for routes of the angular app
app.use(
    '/*',
    express.static(path.join(__dirname, 'angular-app', 'dist', 'angular-app')));


export default app;

export function init(server: https.Server){
  io.init(server, cookieParser, store, secret);
}