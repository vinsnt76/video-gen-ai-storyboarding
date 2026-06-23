// Vercel Serverless Function: api/status.js
// Securely poll JSON2Video render progress

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

    const response = await fetch(`https://api.json2video.com/v2/movies?project=${id}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return res.status(response.status || 400).json({ error: data.message || 'Status query failed' });
    }

    const movie = data.movie;
    const status = movie.status; // queued, running, done, error, timeout

    let mappedStatus = 'rendering';
    let progress = 0;

    if (status === 'queued') {
      mappedStatus = 'rendering';
      progress = 20;
    } else if (status === 'running') {
      mappedStatus = 'rendering';
      progress = 60;
    } else if (status === 'done') {
      mappedStatus = 'done';
      progress = 100;
    } else if (status === 'error' || status === 'timeout') {
      mappedStatus = 'failed';
      progress = 0;
    }

    return res.status(200).json({
      status: mappedStatus,
      url: movie.url,
      progress: progress
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
