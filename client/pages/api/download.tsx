import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { MongoClient, ObjectId } from 'mongodb';

export default async function Downloader(req, res) {
  // Create s3 client connection
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION,
  });

  try {
    // MongoDb connection
    const clientMongo = await MongoClient.connect(
      process.env.NEXT_PUBLIC_MONGO_URI,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    const File = clientMongo.db(process.env.NEXT_PUBLIC_MONGO_DB).collection('files');
    const User = clientMongo.db(process.env.NEXT_PUBLIC_MONGO_DB).collection('users');

    const file = await File.findOne({
      _id: new ObjectId(req.query.fid),
    });

    if (!file) {
      return res.status(404).json({ message: 'INVALID_SESSION' });
    }

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      Key: file.key,
    };

    if (file.private) {
      const session = await getServerSession(req, res, authOptions);
      const user = await User.findOne({
        email: session.user.email,
        _id: new ObjectId(file.uploader)
      })

      if (!user) {
        return res.status(403).json({ message: 'INVALID_SESSION' });
      }
    }

    const objectData = await client.send(new GetObjectCommand(params));
    res.setHeader('Content-disposition', 'attachment; filename=' + file.name);
    res.setHeader('content-type', file.mimetype);
    objectData.Body.pipe(res);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'INVALID_SESSION' });
  }
};
