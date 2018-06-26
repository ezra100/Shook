"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const data = require("./data.json");
var helpers;
(function (helpers) {
    let reallySendEmail = true;
    let transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: data.email, pass: data.password } });
    function sendEmail(email, name, subject, msg) {
        if (!reallySendEmail) {
            return;
        }
        const mailOptions = {
            from: { name: 'Shook', address: data.email },
            to: { name: name, address: email },
            replyTo: data.replyTo,
            subject: subject,
            html: msg // plain text body
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(info);
            }
        });
    }
    helpers.sendEmail = sendEmail;
})(helpers = exports.helpers || (exports.helpers = {}));
//# sourceMappingURL=helpers.js.map