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

  const prompt = body && body.prompt;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

  // Truncate prompt to 1000 chars (DALL-E 2 limit)
  const safePrompt = prompt.slice(0, 1000);

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-2',
        prompt: safePrompt,
        n: 1,
        size: '512x512'
      })
    });

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data));
    
    if (data.error) return res.status(500).json({ error: data.error.message, code: data.error.code });
    if (!data.data || !data.data[0]) return res.status(500).json({ error: 'No image returned', raw: data });
    
    return res.status(200).json({ url: data.data[0].url });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
