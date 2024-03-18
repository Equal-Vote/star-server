import { InternalServerError } from "@curveball/http-errors";
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from 'express';
import  { Upload, Progress } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";

const ID = process.env.S3_ID!;
const SECRET = process.env.S3_SECRET!;

const multer = require("multer");

const storage = multer.memoryStorage();

// The name of the bucket that you have created
const BUCKET_NAME = 'starcandidatephotos';
const s3 = new S3({
    region: 'us-east-1',
    credentials: {
        accessKeyId: ID,
        secretAccessKey: SECRET,
    },
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

interface ImageRequest extends Request {
    file: any
}

// TODO: add multer file and S3 types
const uploadImageController = async (req: ImageRequest, res: Response, next: NextFunction) => {
    const file = req.file

    const params = {
        Bucket: BUCKET_NAME,
        Key: `${randomUUID()}.jpg`, // File name you want to save as in S3
        Body: file.buffer
    };
    try {
      const parallelUploads3 = new Upload({
        client: s3,
        params,
        queueSize: 4, // optional concurrency configuration
        partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
        leavePartsOnError: false, // optional manually handle dropped parts
      });

      parallelUploads3.on("httpUploadProgress", (progress: Progress) => {
        console.log(progress);
      });

      const uploadResult = await parallelUploads3.done();
      const photo_filename = uploadResult.Location;
      console.log(`File uploaded successfully. ${photo_filename}`);
      return res.json({ photo_filename });
    } catch (e: any) {
      throw new InternalServerError(e);
    }
}

module.exports = {
    uploadImageController,
    upload,
}
