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

  const apiKey = process.env.EDEN_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'EDEN_API_KEY is not configured.' });
  }

  try {
    const response = await fetch(`https://api.eden.art/v2/tasks/${id}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Status query failed' });
    }

    const task = data.task;
    
    // Extract generated image URLs from result
    let images = [];
    if (task.result) {
      if (Array.isArray(task.result)) {
        task.result.forEach(resItem => {
          if (resItem.output) {
            if (Array.isArray(resItem.output)) {
              images.push(...resItem.output);
            } else {
              images.push(resItem.output);
            }
          }
        });
      } else if (typeof task.result === 'object') {
        const output = task.result.output;
        if (output) {
          if (Array.isArray(output)) {
            images.push(...output);
          } else {
            images.push(output);
          }
        }
      }
    }

    return res.status(200).json({
      status: task.status, // pending, processing, completed, failed
      images: images
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
