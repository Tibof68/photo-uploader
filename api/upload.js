// /api/upload.js — pour Vercel / Cloudflare R2 (ESM)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    const region = "auto";
    const imageKey = "photo.jpg";

    const client = new S3Client({
      region,
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    const body = req.body;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: imageKey,
      Body: body,
      ContentType: "image/jpeg"
    });

    await client.send(command);

    const publicUrl = `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${imageKey}`;
    res.status(200).json({ url: publicUrl });

  } catch (e) {
    console.error("UPLOAD FAIL:", e);
    res.status(500).json({ error: "Upload failed" });
  }
}