// Vercel Serverless Function: api/generate.js
// Calls Vertex AI Imagen 3 endpoint to generate images and store them in GCS

import { GoogleAuth } from "google-auth-library";
import { Storage } from "@google-cloud/storage";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model, referenceImage } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt parameter' });
  }

  try {
    // 1. Setup GCP Authentication
    const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const projectId = process.env.GCP_PROJECT_ID || "antigravity-cli-and-adk-500010";
    const bucketName = process.env.GCS_BUCKET_NAME || "antigravity-storyboards";

    let authOptions = {
      scopes: "https://www.googleapis.com/auth/cloud-platform"
    };
    let storageOptions = {
      projectId: projectId
    };

    if (serviceAccountJson) {
      const credentials = JSON.parse(serviceAccountJson);
      authOptions.credentials = credentials;
      storageOptions.credentials = credentials;
    }

    const auth = new GoogleAuth(authOptions);
    const client = await auth.getClient();
    const projectId = await auth.getProjectId();

    // 2. Vertex AI Imagen 3 API Configuration (us-central1 region)
    const location = "us-central1";
    const apiEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-002:predict`;

    // 3. Setup Payload (Supporting Text-to-Image and Image-Guided Control if referenceImage is provided)
    const instances = [
      {
        prompt: prompt
      }
    ];

    const parameters = {
      sampleCount: 4,
      aspectRatio: "1:1",
      outputMimeType: "image/png"
    };

    // If a reference uploader seed image GCS/Public URL is linked, pass it as image-to-image context
    if (referenceImage) {
      let gcsUri = referenceImage;
      if (referenceImage.startsWith("https://storage.googleapis.com/")) {
        gcsUri = referenceImage.replace("https://storage.googleapis.com/", "gs://");
      }
      instances[0].image = {
        gcsUri: gcsUri
      };
      parameters.imageGenerationMode = "image-to-image";
    }

    const response = await client.request({
      url: apiEndpoint,
      method: "POST",
      data: {
        instances,
        parameters
      }
    });

    const predictions = response.data.predictions;
    if (!predictions || predictions.length === 0) {
      throw new Error("No predictions returned from Vertex AI Imagen");
    }

    // 4. Save generated base64 images directly into the public GCS bucket
    const storage = new Storage(storageOptions);
    const publicUrls = [];

    for (let i = 0; i < predictions.length; i++) {
      const base64Image = predictions[i].bytesBase64Encoded;
      const buffer = Buffer.from(base64Image, 'base64');
      const filename = `generated-sheets/${crypto.randomUUID()}-${i}.png`;
      const file = storage.bucket(bucketName).file(filename);

      await file.save(buffer, {
        contentType: 'image/png',
        resumable: false,
        public: true // Make file public for JSON2Video and UI reading
      });

      publicUrls.push(`https://storage.googleapis.com/${bucketName}/${filename}`);
    }

    // Return GCS paths back to the client immediately (no polling needed)
    return res.status(200).json({
      success: true,
      images: publicUrls
    });

  } catch (error) {
    console.error("Imagen 3 generation failed:", error);
    
    // Graceful fallback to simulated assets if Vertex AI key is not loaded or scopes fail
    const isIndustrial = prompt.toLowerCase().includes('industrial') || 
                         prompt.toLowerCase().includes('pipe') || 
                         prompt.toLowerCase().includes('refinery') || 
                         prompt.toLowerCase().includes('factory') || 
                         prompt.toLowerCase().includes('building');

    const mockImages = isIndustrial ? [
      'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=300&q=80',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=300&q=80'
    ] : [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80'
    ];

    return res.status(200).json({
      success: true,
      mock: true,
      images: mockImages,
      errorInfo: error.message
    });
  }
}
