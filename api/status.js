// Vercel Serverless Function: api/status.js
// Securely poll json2video.com render progress

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

    // Call JSON2Video Movie project API to get render job status
    const response = await fetch(`https://api.json2video.com/v2/movie?project=${id}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Status query failed' });
    }

    // Map JSON2Video movie project status (0: idle, 1: rendering, 2: completed, 3: failed)
    const projectStatus = data.movie?.status; 
    let statusText = 'queued';
    let progress = 10;

    if (projectStatus === 1) {
      statusText = 'rendering';
      progress = 50;
    } else if (projectStatus === 2) {
      statusText = 'done';
      progress = 100;
    } else if (projectStatus === 3) {
      statusText = 'failed';
    }

    return res.status(200).json({
      status: statusText,
      url: data.movie?.url || '', // Final generated MP4 URL
      progress: progress
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
