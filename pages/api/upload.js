export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const crypto = await import('node:crypto');

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;
  const region = 'auto'; // Pour Cloudflare
  const fileName = 'photo.jpg'; // Nom fixe pour l’URL

  const base64Data = req.body?.image;
  if (!base64Data) {
    return res.status(400).json({ error: 'Missing image data' });
  }

  const buffer = Buffer.from(base64Data, 'base64');

  const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const url = `${endpoint}/${R2_BUCKET_NAME}/${fileName}`;

  const date = new Date().toUTCString();
  const contentType = 'image/jpeg';
  const method = 'PUT';
  const canonicalString = `${method}\n\n${contentType}\n${date}\n/${R2_BUCKET_NAME}/${fileName}`;
  const signature = crypto.createHmac('sha1', R2_SECRET_ACCESS_KEY).update(canonicalString).digest('base64');
  const authorization = `AWS ${R2_ACCESS_KEY_ID}:${signature}`;

  const uploadRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Date': date,
      'Authorization': authorization,
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    return res.status(uploadRes.status).json({ error: 'Upload to R2 failed', details: errorText });
  }

  return res.status(200).json({
    message: 'Upload successful',
    url: `https://${R2_ACCOUNT_ID}.r2.dev/${fileName}`,
  });
}