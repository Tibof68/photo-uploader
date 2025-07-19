export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const bucketUrl = 'https://pub-410415b6228c4a169301887ee062d0b1.r2.dev/photo.jpg';

  try {
    const upload = await fetch(bucketUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg'
      },
      body: req.body
    });

    if (!upload.ok) {
      return res.status(upload.status).json({ error: 'Upload failed' });
    }

    return res.status(200).json({ message: 'Upload success' });
  } catch (err) {
    return res.status(500).json({ error: 'Upload error', details: err.message });
  }
}
