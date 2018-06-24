import * as crypto from "crypto";

export var hashLength : number = 8;


export function getRandomString(length: number =  hashLength): string {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString("hex") /** convert to hexadecimal format */
        .slice(0, length);   /** return required number of characters */
}
export function sha512(password: string, salt: string): string {
    var hash = crypto.createHmac("sha512", salt); /** Hashing algorithm sha512 */
    hash.update(password);
    return hash.digest("hex");
}