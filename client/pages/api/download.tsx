import {
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
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


  async function fileDownloader(params, file) {
    const objectData = await client.send(new GetObjectCommand(params));
    res.setHeader('Content-disposition', 'attachment; filename=' + file.name);
    res.setHeader('content-type', file.mimetype);
    objectData.Body.pipe(res);
  }

  try {
    // MongoDb connection
    const client = await MongoClient.connect(
      process.env.NEXT_PUBLIC_MONGO_URI,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    const File = client.db(process.env.NEXT_PUBLIC_MONGO_DB).collection('files');
    const User = client.db(process.env.NEXT_PUBLIC_MONGO_DB).collection('users');

    let fileCursor = await File.find({
      _id: new ObjectId(req.query.fid),
    });
    let file = await fileCursor.toArray();

    // Check if file exists
    if (file) {
      file = file[0]
      const params = {
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: file.key,
      };

      if (file.private) {
        const session = await getServerSession(req, res, authOptions);

        let userCursor = await User.find({
          email: session.user.email,
          _id: new ObjectId(file.uploader)
        })

        let userAuth = await userCursor.toArray();

        return userAuth.length == 1 ? await fileDownloader(params, file) : res.status(403).json({ message: 'INVALID_SESSION' });
      } else {
        return await fileDownloader(params, file);
      }

    } else {
      return res.status(404).json({ message: 'INVALID_URL' });
    }
  } catch (e) {
    return res.status(500).json({ message: 'INVALID_SESSION' });
  }

};
