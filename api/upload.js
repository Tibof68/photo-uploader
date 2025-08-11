import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, fileName } = JSON.parse(req.body);

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // 🔹 Nom de fichier : si fileName existe → on l'utilise, sinon photo.jpg
    const finalName = fileName && fileName.trim() !== "" ? fileName : "photo.jpg";

    const buffer = Buffer.from(image, "base64");

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: finalName,
      Body: buffer,
      ContentType: "image/jpeg",
      ACL: "public-read", // si nécessaire
    });

    await client.send(command);

    const publicUrl = `https://${process.env.R2_BUCKET_PUBLIC_DOMAIN}/${finalName}`;

    res.status(200).json({ success: true, url: publicUrl });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
}