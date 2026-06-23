// Test script to verify API keys for Eden Art and Shotstack (JSON-to-Video)
// Run with: node test-api-keys.js

import fs from 'fs';

// Manually parse .env file if it exists to avoid external dependencies
if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if present
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.substring(1, value.length - 1);
      } else if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const EDEN_API_KEY = process.env.EDEN_API_KEY || process.env.EDENAI_API_KEY;
const JSON_TO_VIDEO_API_KEY = process.env.JSON_TO_VIDEO_API_KEY;

console.log('--- API Key Verification Tool ---');

async function testEdenKey() {
  if (!EDEN_API_KEY) {
    console.log('❌ EDEN_API_KEY (or EDENAI_API_KEY) is not set in your environment.');
    return;
  }

  // Obfuscate key for logging
  const maskedKey = EDEN_API_KEY.slice(0, 6) + '...' + EDEN_API_KEY.slice(-4);
  console.log(`Testing Eden AI API Key: ${maskedKey}`);

  try {
    // We send a POST request with an invalid provider.
    // An invalid key will return 401/403 (Unauthorized/Forbidden).
    // A valid key will return 400 (Bad Request) indicating provider validation error, but auth succeeded.
    const response = await fetch('https://api.edenai.run/v2/image/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EDEN_API_KEY}`
      },
      body: JSON.stringify({
        providers: 'invalid_provider_to_test_auth_only',
        text: 'test',
        resolution: '256x256'
      })
    });

    if (response.status === 401 || response.status === 403) {
      console.log(`❌ Eden AI API Key is INVALID (Status: ${response.status})`);
    } else {
      console.log(`✅ Eden AI API Key is WORKING! (Authenticated successfully, response status: ${response.status})`);
    }
  } catch (error) {
    console.log(`❌ Failed to connect to Eden AI API: ${error.message}`);
  }
}

async function testJsonToVideoKey() {
  if (!JSON_TO_VIDEO_API_KEY) {
    console.log('❌ JSON_TO_VIDEO_API_KEY is not set in your environment.');
    return;
  }

  // Obfuscate key for logging
  const maskedKey = JSON_TO_VIDEO_API_KEY.slice(0, 6) + '...' + JSON_TO_VIDEO_API_KEY.slice(-4);
  console.log(`Testing JSON2Video API Key: ${maskedKey}`);

  try {
    // We query a dummy project ID.
    // A valid key returns 404 (Not Found) or 400 (Invalid ID), whereas an invalid key returns 403 (Forbidden) or 401.
    const response = await fetch('https://api.json2video.com/v2/movies?project=00000000-0000-0000-0000-000000000000', {
      method: 'GET',
      headers: {
        'x-api-key': JSON_TO_VIDEO_API_KEY
      }
    });

    if (response.status === 401 || response.status === 403) {
      console.log(`❌ JSON2Video API Key is INVALID (Status: ${response.status})`);
    } else {
      console.log(`✅ JSON2Video API Key is WORKING! (Authenticated successfully, response status: ${response.status})`);
    }
  } catch (error) {
    console.log(`❌ Failed to connect to JSON2Video API: ${error.message}`);
  }
}

async function run() {
  await testEdenKey();
  console.log('---------------------------------');
  await testJsonToVideoKey();
}

run();
