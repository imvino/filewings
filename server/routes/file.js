//Packages
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
var mongoose = require('mongoose');

// AWS Packages
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Modules
const verifyGoogleToken = require('../utils/verify');
const { cacheData } = require('../utils/cache');
const File = require('../models/File');

// Send from memory without saving in server
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create s3 client connection
const client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_BUCKET_REGION,
});

// List user file details
router.route('/list').post(async (req, res, next) => {
  // Check token before listing
  let result = await verifyGoogleToken(res, req.headers?.authorization);
  if (result?.email) {
    try {
      const userInfo = await cacheData(result.email);
      const userFiles = await File.find({
        uploader: userInfo._id,
      })
        .sort('-createdAt')
        .exec();
      res.status(200).json({ message: userFiles });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: e });
    }
  }

  // const getObjectParams = {
  //   Bucket: process.env.AWS_BUCKET_NAME,
  //   Key: 'Screenshot 2023-02-21 at 9.26.35 PM.png',
  // };

  // const command = new GetObjectCommand(getObjectParams);
  // const url = await getSignedUrl(client, command, { expiresIn: 0 });
});

router.route('/delete').post(async (req, res, next) => {
  // Check token before deleting
  let result = await verifyGoogleToken(res, req.headers?.authorization);
  if (result?.email) {
    try {
      const delParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.body.key,
      };
      // Delete from s3
      const command = new DeleteObjectCommand(delParams);
      const s3DeleteStatus = await client.send(command);
      if (s3DeleteStatus) {
        // Delete from db
        await File.deleteOne({
          key: req.body.key,
        }).exec();
        return res.status(200).json({ message: 'FILE_DELETED' });
      }
    } catch (e) {
      return res.status(500).json({ message: e });
    }
  }
});

router.route('/upload').post(upload.single('file'), async (req, res, next) => {
  // Check token before inserting
  let result = await verifyGoogleToken(res, req.headers?.authorization);
  let private = req.body.private == 'private' ? true : false;
  if (result?.email) {
    try {
      // Initialize data
      const userInfo = await cacheData(result.email);
      const file = req.file;
      const key = `${userInfo._id}/${uuidv4()}`;

      const dbInsertParams = {
        name: file.originalname,
        uploader: userInfo._id,
        key,
        private,
        size: file.size,
        mimetype: file.mimetype,
      };

      const awsInsertParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };
      ////////////////////////////////////////////////////////////////

      // Check for duplicate file before inserting
      const duplicate = await File.findOne({
        name: file.originalname,
        uploader: userInfo._id,
      }).exec();

      if (duplicate) {
        return res.status(409).json({ message: 'DUPLICATE_FILE_FOUND' });
      }

      // Insert into AWS
      const command = new PutObjectCommand(awsInsertParams);
      let s3UploadStatus = await client.send(command);
      if (s3UploadStatus) {
        // Insert into Database
        await new File(dbInsertParams).save();
        return res.status(200).json({ message: 'FILE_UPLOADED' });
      }
    } catch (e) {
      return res.status(500).json({ message: e });
    }
  } else {
    return res.status(401).json({ message: 'UNAUTHORIZED_REQUEST' });
  }
});

module.exports = router;
