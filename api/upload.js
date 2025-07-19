import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // pour les images
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "imageBase64 manquant" });
  }

  try {
    const accountId = process.env.ACCOUNT_ID;
    const accessKeyId = process.env.ACCESS_KEY_ID;
    const secretAccessKey = process.env.SECRET_ACCESS_KEY;
    const bucketName = process.env.BUCKET_NAME;
    const region = "auto";
    const uploadFileName = "photo.jpg";

    const imageBuffer = Buffer.from(imageBase64, "base64");

    const client = new S3Client({
      region,
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const uploadParams = {
      Bucket: bucketName,
      Key: uploadFileName,
      Body: imageBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read", // Si nécessaire, selon ta config R2
    };

    await client.send(new PutObjectCommand(uploadParams));

    const publicUrl = `https://${bucketName}.r2.dev/${uploadFileName}`;
    res.status(200).json({ url: publicUrl });

  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
}
