import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME
  } = process.env;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  const base64Data = req.body?.image;

  if (!base64Data) {
    return res.status(400).json({ error: 'Missing image data' });
  }

  const fileBuffer = Buffer.from(base64Data, 'base64');
  const fileName = 'photo.jpg'; // nom fixe pour que l’URL ne change pas
  const contentType = 'image/jpeg';

  const now = new Date().toUTCString();
  const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const path = `/${R2_BUCKET_NAME}/${fileName}`;
  const stringToSign = `PUT\n\n${contentType}\n${now}\n${path}`;

  const signature = crypto
    .createHmac('sha1', R2_SECRET_ACCESS_KEY)
    .update(stringToSign)
    .digest('base64');

  const authHeader = `AWS ${R2_ACCESS_KEY_ID}:${signature}`;

  const uploadResponse = await fetch(`${endpoint}/${R2_BUCKET_NAME}/${fileName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Date': now,
      'Authorization': authHeader,
    },
    body: fileBuffer,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    return res.status(uploadResponse.status).json({ error: 'Upload to R2 failed', details: error });
  }

  const imageUrl = `https://${R2_ACCOUNT_ID}.r2.dev/${fileName}`;
  return res.status(200).json({ message: 'Upload successful', url: imageUrl });
}