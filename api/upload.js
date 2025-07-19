import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = "auto";
const endpoint = `https://${process.env.S3_ENDPOINT}`;
const bucket = process.env.S3_BUCKET;

const client = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename, data } = req.body;

  try {
    const buffer = Buffer.from(data, "base64");

    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buffer,
      ContentType: "image/jpeg"
    }));

    const publicUrl = `https://${process.env.S3_ENDPOINT}/${filename}`;
    res.status(200).json({ url: publicUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
