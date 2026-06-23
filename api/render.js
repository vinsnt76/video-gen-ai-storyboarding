// Vercel Serverless Function: api/render.js
// Proxies render requests to json2video.com securely

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { panels, duration, prompt } = req.body;

  if (!panels || !Array.isArray(panels) || panels.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid panels list' });
  }

  // Calculate duration per panel
  const durationPerPanel = Number(duration) / panels.length;

  // Format elements matching JSON2Video project schema
  const scenes = panels.map((panel, index) => ({
    comment: `Panel ${panel.id}`,
    elements: [
      {
        type: 'image',
        src: panel.image || 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80',
        duration: durationPerPanel,
        extra: {
          zoom: 'in' // Adds camera zoom effect for cinematic motion
        }
      }
    ]
  }));

  const payload = {
    resolution: 'hd',
    quality: 'high',
    scenes: scenes
  };

  try {
    const apiKey = process.env.JSON_TO_VIDEO_API_KEY;
    if (!apiKey) {
      console.warn('JSON_TO_VIDEO_API_KEY not found. Running in simulation mode.');
      return res.status(200).json({ 
        success: true, 
        mock: true,
        renderId: 'mock-render-' + Math.floor(Math.random() * 10000)
      });
    }

    // Call JSON2Video API
    const response = await fetch('https://api.json2video.com/v2/movie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'JSON2Video render request failed' });
    }

    return res.status(200).json({ 
      success: true, 
      renderId: data.project // JSON2Video returns project UUID
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
