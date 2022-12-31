import { InternalServerError } from "@curveball/http-errors";
import { randomUUID } from "crypto";
const S3 = require("aws-sdk/clients/s3");
const ID = process.env.S3_ID;
const SECRET = process.env.S3_SECRET;

const multer = require("multer");

const storage = multer.memoryStorage();

// The name of the bucket that you have created
const BUCKET_NAME = 'starcandidatephotos';
const s3 = new S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

const fileFilter = (req: any, file: any, cb: any) => {
    console.log(file)
    if (file.mimetype.split("/")[0] === "image") {
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1000000000, files: 1 },
  });


const uploadImageController = async (req: any, res: any, next: any) => {
    const file = req.file

    const params = {
        Bucket: BUCKET_NAME,
        Key: `${randomUUID()}.jpg`, // File name you want to save as in S3
        Body: file.buffer
    };

    let photo_filename = ''
    s3.upload(params, function (err: any, data: any) {
        if (err) {
            throw new InternalServerError(err);
        }
        console.log(`File uploaded successfully. ${data.Location}`);
        photo_filename = data.Location
        return res.json({ photo_filename: photo_filename })
    });
}

module.exports = {
    uploadImageController,
    upload,
}