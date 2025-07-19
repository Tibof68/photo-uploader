export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, UPLOAD_FILENAME } = process.env;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !UPLOAD_FILENAME) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  const fileBuffer = await req.arrayBuffer();
  const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const uploadUrl = `${endpoint}/${UPLOAD_FILENAME}`;

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': fileBuffer.byteLength,
      'Authorization': 'AWS ' + R2_ACCESS_KEY_ID + ':' + signAWS(R2_SECRET_ACCESS_KEY, 'PUT', UPLOAD_FILENAME),
    },
    body: Buffer.from(fileBuffer),
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Upload failed' });
  }

  const publicUrl = `https://${R2_ACCOUNT_ID}.r2.dev/${UPLOAD_FILENAME}`;
  return res.status(200).json({ url: publicUrl });
}

// ⚠️ Simulé — à remplacer par signature valide si besoin (Cloudflare peut aussi gérer des tokens pré-signés)
function signAWS(secretKey, method, fileName) {
  return 'dummy-signature'; // Juste pour test local, remplacer par signature AWS si nécessaire
}