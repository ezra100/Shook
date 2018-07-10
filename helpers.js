"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const data = require("./data.json");
var helpers;
(function (helpers) {
    let reallySendEmail = true;
    let transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: data.email, pass: data.password } });
    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }
    helpers.escapeRegExp = escapeRegExp;
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
    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    helpers.validateEmail = validateEmail;
    // checks if url is a valid URL, includes relative url
    function isValidURL(url) {
        return /^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/i
            .test(url);
    }
    helpers.isValidURL = isValidURL;
    function asyncWrapper(fn) {
        return function (req, res) {
            fn(req, res).catch((err) => res.status(500).end(err.message));
        };
    }
    helpers.asyncWrapper = asyncWrapper;
})(helpers = exports.helpers || (exports.helpers = {}));
//# sourceMappingURL=helpers.js.map