# AI Storyboarding & Video Generation App

An interactive web application designed to generate storyboards and compile them into cinematic videos using AI. The app combines a modern React frontend with secure Vercel serverless function proxies.

---

## 🚀 Key Features

* **AI Reference Sheet Generator**: Generate prompt-based character or environment sheets using **Eden AI** (DALL-E 3).
* **Interactive Storyboard Grid**: Create and edit panels, apply custom camera movements, and regenerate individual panels.
* **AI Video Sequencer**: Compile storyboard panels into high-quality MP4 videos using **JSON2Video**.
* **Zero-State Serverless Backend**: Proxies API requests to secure your credentials, encoding task parameters into tokens for stateless polling.

---

## 🛠️ Technology Stack

* **Frontend**: React, Vite, TailwindCSS, Lucide Icons.
* **Backend**: Node.js Vercel Serverless Functions (`/api/*`).
* **AI Services**:
  * **Eden AI** (`edenai.co`) for panel image generation.
  * **JSON2Video** (`json2video.com`) for video compiling.

---

## ⚙️ Setup & Credentials

1. Create a `.env` file in the project root:
   ```env
   EDEN_API_KEY=your_eden_ai_master_production_token
   JSON_TO_VIDEO_API_KEY=your_json2video_api_key
   ```
   > *Note: Make sure to use the **Master Production API Token** from your Eden AI settings panel.*

2. Ensure your `.env` is ignored by Git (already configured in `.gitignore`).

---

## 💻 Local Development

Because the project relies on serverless functions in the `/api` directory, you must run it with the Vercel dev server instead of standard Vite to handle proxy routing:

1. **Install Vercel CLI (if not already installed)**:
   ```bash
   npm install -g vercel
   ```
2. **Start the development server**:
   ```bash
   vercel dev
   ```
   *(Or run `npx vercel dev` to launch without installing globally)*.

3. **Verify API Credentials**:
   You can verify your configuration at any time by running the built-in diagnostic tool:
   ```bash
   node test-api-keys.js
   ```

---

## 📁 Project Structure

```text
├── api/                   # Vercel serverless api functions
│   ├── generate.js        # Submits image requests (base64 token generator)
│   ├── generate-status.js # Calls Eden AI and handles synchronous generation
│   ├── render.js          # Formats and sends scenes to JSON2Video
│   └── status.js          # Polls video rendering status from JSON2Video
├── src/                   # React frontend components and state
│   ├── components/
│   │   ├── ReferenceSheetTab.jsx
│   │   ├── StoryboardTab.jsx
│   │   ├── VideoTab.jsx
│   │   └── EditorTab.jsx
│   ├── App.jsx
│   └── main.jsx
├── test-api-keys.js       # Local verification tool for keys
├── .env                   # Local credentials (ignored by git)
├── .gitignore             # Git ignore file
└── package.json           # Project dependencies
```
