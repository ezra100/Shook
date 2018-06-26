"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
exports.hashLength = 8;
function getRandomString(length = exports.hashLength) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString("hex") /** convert to hexadecimal format */
        .slice(0, length); /** return required number of characters */
}
exports.getRandomString = getRandomString;
function sha512(password, salt) {
    var hash = crypto.createHmac("sha512", salt); /** Hashing algorithm sha512 */
    hash.update(password);
    return hash.digest("hex");
}
exports.sha512 = sha512;
//# sourceMappingURL=crypto.js.map