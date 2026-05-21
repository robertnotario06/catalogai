module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }

  const query = body && body.prompt;
  if (!query) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const searchQuery = encodeURIComponent(query.split(',')[0].trim());
    const url = `https://api.unsplash.com/photos/random?query=${searchQuery}&orientation=squarish&content_filter=high`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });

    const data = await response.json();

    if (data.errors) return res.status(500).json({ error: data.errors[0] });
    if (!data.urls) return res.status(500).json({ error: 'No image found' });

    return res.status(200).json({ url: data.urls.regular });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
