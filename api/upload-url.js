// Vercel Serverless Function: api/upload-url.js
// Generates a signed URL to upload files directly from the browser to GCS

import { Storage } from "@google-cloud/storage";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Load credentials from environment variable JSON
    const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const projectId = process.env.GCP_PROJECT_ID || "antigravity-cli-and-adk-500010";
    const bucketName = process.env.GCS_BUCKET_NAME || "antigravity-storyboards";

    let storageOptions = {
      projectId: projectId
    };

    if (serviceAccountJson) {
      const credentials = JSON.parse(serviceAccountJson);
      storageOptions.credentials = credentials;
    }

    const storage = new Storage(storageOptions);
    const filename = `${crypto.randomUUID()}.png`;
    const blobName = `seed-images/${filename}`;

    const [url] = await storage
      .bucket(bucketName)
      .file(blobName)
      .getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
        contentType: "image/png",
      });

    const [readUrl] = await storage
      .bucket(bucketName)
      .file(blobName)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours expiry
      });

    const publicUrl = readUrl;

    return res.status(200).json({
      uploadUrl: url,
      publicUrl: publicUrl,
      gcsPath: `gs://${bucketName}/${blobName}`,
    });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return res.status(500).json({ error: error.message });
  }
}
