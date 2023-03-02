const { v4 } = require('uuid');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const File = require('../models/File');
const { cacheData } = require('../utils/cache');

// Create s3 client connection
const client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_BUCKET_REGION,
});

exports.listFile = async (req, res) => {
  try {
    // Retrieve user info from cache
    const userInfo = await cacheData(req.user.email);

    // Find user files in database
    const userFiles = await File.find({
      uploader: userInfo._id,
    })
      .sort('-createdAt')
      .exec();

    // Send response with user files
    res.status(200).json({ message: userFiles });
  } catch (error) {
    // Handle server error
    console.error(error);
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    // Initialize data
    const { _id } = await cacheData(req.user.email);
    const { originalname, size, mimetype, buffer } = req.file;
    const isPrivate = req.body.private === 'private';
    const key = `${_id}/${v4()}`;
    const dbParams = {
      name: originalname,
      uploader: _id,
      key,
      private: isPrivate,
      size,
      mimetype,
    };
    const awsParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    // Check for duplicate file before uploading
    const duplicate = await File.findOne({ name: originalname, uploader: _id });
    if (duplicate)
      return res.status(409).json({ message: 'DUPLICATE_FILE_FOUND' });
    // Upload data
    await Promise.all([
      client.send(new PutObjectCommand(awsParams)),
      new File(dbParams).save(),
    ]);
    // Send response
    return res.status(200).json({ message: 'FILE_UPLOADED' });
  } catch (error) {
    // Handle server error
    console.error(error);
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    // Delete data
    await Promise.all([
      client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: req.body.key,
        })
      ),
      File.deleteOne({
        key: req.body.key,
      }).exec(),
    ]);
    // Send response
    return res.status(200).json({ message: 'FILE_DELETED' });
  } catch (error) {
    // Handle server error
    console.error(error);
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
};
