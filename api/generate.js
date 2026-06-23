// Vercel Serverless Function: api/generate.js
// Securely proxies image generation requests to the Eden Art API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt parameter' });
  }

  const apiKey = process.env.EDEN_API_KEY;

  if (!apiKey) {
    // Mock mode fallback for local dev when env keys aren't set yet
    console.warn('EDEN_API_KEY not found. Running in simulation mode.');
    return res.status(200).json({
      success: true,
      mock: true,
      taskId: 'mock-eden-task-' + Math.floor(Math.random() * 100000)
    });
  }

  // Map chosen UI model to Eden Art tools
  // GPT Image 2 -> openai_image_generate
  // Nano Banana Pro -> flux_schnell
  const toolName = model === 'Nano Banana Pro' ? 'flux_schnell' : 'openai_image_generate';

  const payload = {
    tool: toolName,
    args: {
      prompt: prompt,
      n_samples: 4
    },
    makePublic: false
  };

  try {
    const response = await fetch('https://api.eden.art/v2/tasks/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Eden task creation failed' });
    }

    return res.status(200).json({
      success: true,
      taskId: data.task._id
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
