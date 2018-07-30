import {Request, Response} from 'express-serve-static-core'
import * as nodemailer from 'nodemailer';

import * as data from './data.json';

export namespace helpers {
  let reallySendEmail = true;
  let transporter = nodemailer.createTransport(
      {service: 'gmail', auth: {user: data.email, pass: data.password}});



  export function escapeRegExp(str: string): string {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }
  export function sendEmail(
      email: string, name: string, subject: string, msg: string): void {
    if (!reallySendEmail) {
      return;
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: {name: 'Shook', address: data.email},  // sender address
      to: {name: name, address: email},            // list of receivers
      replyTo: data.replyTo,
      subject: subject,  // subject line
      html: msg          // plain text body
    };
    transporter.sendMail(mailOptions, function(err, info): void {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
  }

  export function validateEmail(email: string): boolean {
    var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  // checks if url is a valid URL, includes relative url
  export function isValidURL(url: string) {
    return /https?:/i.test( new URL(url).protocol);
  }

  export function asyncWrapper(
      fn: (req: Request, res: Response) => Promise<any>) {
    return function(req: Request, res: Response) {
      fn(req, res).catch((err: Error) => res.status(500).end(err.message))
    }
  }

  export function regexToMongoRegex(regex: RegExp) {
    return {$regex: regex.source, $options: regex.flags};
  }
}