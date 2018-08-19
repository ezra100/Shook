import * as multer from 'multer';
import * as mime from 'mime';
import * as path from 'path';
import * as crypto from 'crypto'
var storage = multer.diskStorage({
    destination: path.join(__dirname, '/public/img/'),
    filename: function (req, file, cb) {
        crypto.randomBytes(16, function (err, raw) {
            cb(null, raw.toString("hex") + Date.now() + "." + mime.getExtension(file.mimetype));
        });
    }
});

let upload = multer({ storage });
export default upload;