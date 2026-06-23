// Vercel Serverless Function: api/status.js
// Securely poll Shotstack render progress

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing render ID parameter' });
  }

  // Handle mock responses
  if (id.startsWith('mock-render-')) {
    return res.status(200).json({
      status: 'done',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-neon-city-street-at-night-40242-large.mp4'
    });
  }

  try {
    const apiKey = process.env.JSON_TO_VIDEO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'JSON_TO_VIDEO_API_KEY is not configured.' });
    }

    const response = await fetch(`https://api.shotstack.io/v1/render/${id}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Status query failed' });
    }

    const status = data.response.status;
    let progress = 0;
    if (status === 'queued') progress = 10;
    else if (status === 'fetching') progress = 30;
    else if (status === 'rendering') progress = 60;
    else if (status === 'saving') progress = 85;
    else if (status === 'done') progress = 100;

    return res.status(200).json({
      status: status, // queued, rendering, done, failed
      url: data.response.url,
      progress: progress
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
