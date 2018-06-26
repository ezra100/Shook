// tslint:disable:typedef

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import {Request} from 'express';
import {Response} from 'express-serve-static-core';
import * as session from 'express-session';
import * as fs from 'fs';
import * as path from 'path';

import * as auth from './auth/auth';
import {passport} from './auth/passport';
import {initDB} from './DB/data-generator';
import * as users from './users/users';

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
// this must become before loginRouter
app.use(session({secret}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', auth.router);
app.use('/users', users.router);

app.use('/', express.static(path.join(__dirname, 'public')));



// server favicon
app.get('/favicon.ico', function(req: Request, res: Response) {
  res.sendFile(path.join(__dirname, 'public/img/favicon.jpg'));
});



export default app;