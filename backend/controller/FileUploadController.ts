import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

const initializeFirebase = () => {
  // const serviceAccount = require(filePath);
  const serviceAccount: any = {
    project_id: process.env.PROJECT_ID,
    private_key: (process.env.PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL
  }
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.STORAGE_BUCKET,
    });
  }
};

export const uploadFileToFirebase = async (file: any): Promise<string> => {
  try {
    initializeFirebase();
    const bucket = admin.storage().bucket();
    const uniqueFileName = `${uuidv4()}_${file.originalFilename}`;
    const blob = bucket.file(uniqueFileName);

    await new Promise<void>((resolve, reject) => {
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype || undefined,
        },
      });

      blobStream.on("error", (error) => reject(error));
      blobStream.on("finish", async () => {
        await blob.makePublic();
        resolve();
      });

      fs.readFile(file.filepath, (err, data) => {
        if (err) reject(err);
        blobStream.end(data);
      });
    });

    return `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
  } catch (error) {
    throw new Error("File upload failed: " + error);
  }
};
