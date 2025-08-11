import crypto from "crypto";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileName, fileData } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ error: "Missing fileName or fileData" });
    }

    // Infos Cloudflare R2 depuis tes variables d'environnement Vercel
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;

    const region = "auto";
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${fileName}`;

    // Conversion base64 → Buffer
    const buffer = Buffer.from(fileData, "base64");

    // Signature S3 (simple PUT)
    const date = new Date().toUTCString();
    const stringToSign = `PUT\n\nimage/jpeg\n${date}\n/${bucketName}/${fileName}`;
    const signature = crypto
      .createHmac("sha1", secretKey)
      .update(stringToSign)
      .digest("base64");

    const authHeader = `AWS ${accessKey}:${signature}`;

    const putRes = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "image/jpeg",
        "Date": date,
        "Authorization": authHeader
      },
      body: buffer
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      return res.status(500).json({ error: "Upload failed", details: errText });
    }

    // URL publique
    const publicUrl = `https://pub-${accountId}.r2.dev/${fileName}`;
    res.status(200).json({ url: publicUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}