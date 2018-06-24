import * as nodemailer from 'nodemailer';

import * as data from './data.json';
import {User} from './types';


export namespace helpers {
  let reallySendEmail = true;
  let transporter = nodemailer.createTransport(
      {service: 'gmail', auth: {user: data.email, pass: data.password}});


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
}