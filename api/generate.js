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

  const apiKey = process.env.EDEN_API_KEY || process.env.EDENAI_API_KEY;

  if (!apiKey) {
    // Mock mode fallback for local dev when env keys aren't set yet
    console.warn('EDEN_API_KEY/EDENAI_API_KEY not found. Running in simulation mode.');
    return res.status(200).json({
      success: true,
      mock: true,
      taskId: 'mock-eden-task-' + Math.floor(Math.random() * 100000)
    });
  }

  try {
    // Encode the prompt and model into a base64 token so we don't need server-side state
    const payload = { prompt, model };
    const taskId = 'edenai-task-' + Buffer.from(JSON.stringify(payload)).toString('base64');

    return res.status(200).json({
      success: true,
      taskId: taskId
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
