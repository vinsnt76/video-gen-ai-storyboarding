// Vercel Serverless Function: api/generate-status.js
// Securely polls task status from the Eden Art API

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing task ID parameter' });
  }

  // Handle mock responses
  if (id.startsWith('mock-eden-task-')) {
    return res.status(200).json({
      status: 'completed',
      images: [
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80', // Front Portrait
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80', // Expression
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80', // Side Profile
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80'  // Action Pose
      ]
    });
  }

  const apiKey = process.env.EDEN_API_KEY || process.env.EDENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'EDEN_API_KEY or EDENAI_API_KEY is not configured.' });
  }

  if (!id.startsWith('edenai-task-')) {
    return res.status(400).json({ error: 'Invalid task ID format' });
  }

  try {
    // Decode the prompt and model from the base64 ID
    const payloadStr = Buffer.from(id.replace('edenai-task-', ''), 'base64').toString('utf-8');
    const { prompt, model } = JSON.parse(payloadStr);

    // Map UI model to Eden AI provider
    // GPT Image 2 -> openai
    // Nano Banana Pro -> stabilityai
    const provider = model === 'Nano Banana Pro' ? 'stabilityai' : 'openai';

    const response = await fetch('https://api.edenai.run/v2/image/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        providers: provider,
        text: prompt,
        resolution: '512x512',
        num_images: 4
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Eden AI task failed' });
    }

    const providerResult = data[provider];
    let images = [];

    if (providerResult && providerResult.items) {
      images = providerResult.items.map(item => item.image_resource_url || item.image);
    }

    // Since this is a synchronous call wrapped in a polling endpoint, we return completed immediately
    return res.status(200).json({
      status: 'completed',
      images: images
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
