# Antigravity Video-Gen Studio

A premium, serverless-first storyboard-to-video workflow interface deployed on Vercel. Integrates Google Vertex AI (Imagen 3) for style sheets and storyboard panels, saving assets directly to Google Cloud Storage (GCS) and compiling them into video edits via JSON2Video.

---

## 🛠 Required Environment Variables

For live integrations, configure these keys in your **Vercel Project Settings**:

| Variable Name | Description / Format | Location |
| :--- | :--- | :--- |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | The entire service account key JSON file | GCP IAM Console |
| `JSON_TO_VIDEO_API_KEY` | Raw key string | [JSON2Video API Dashboard](https://json2video.com/dashboard/apikeys) |

*Note: The `EDENAI_API_KEY` is deprecated and can be safely deleted.*

---

## 🧪 How to Test API Keys & Integration

You can run direct diagnostic curl commands or local Node.js tests to verify your environment variables.

### 1. Test GCS Signed URL & Auth
Run this in your local console to verify your GCP Service Account credentials JSON is configured correctly and has write permissions to GCS:
```bash
node -e "
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId: 'antigravity-cli-and-adk-500010',
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
});
storage.bucket('antigravity-storyboards').file('test-check.txt').save('verify').then(() => console.log('✅ GCS Write Success')).catch(console.error);
"
```

### 2. Test Imagen 3 Vertex AI generation
Verify that your GCP service account has the **Vertex AI User** role (`roles/aiplatform.user`) active:
```bash
node -e "
const { GoogleAuth } = require('google-auth-library');
const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
});
auth.getClient().then(client => {
  client.request({
    url: 'https://us-central1-aiplatform.googleapis.com/v1/projects/antigravity-cli-and-adk-500010/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict',
    method: 'POST',
    data: { instances: [{ prompt: 'Red square' }], parameters: { sampleCount: 1 } }
  }).then(() => console.log('✅ Vertex AI Imagen Access Success')).catch(console.error);
});
"
```

### 3. Test JSON2Video API key
Confirm your render key is valid:
```bash
curl -X GET "https://api.json2video.com/v2/movie" -H "x-api-key: YOUR_JSON2VIDEO_KEY"
```
*(A successful key returns a JSON response containing movie arrays or empty lists, not an authentication failure).*
