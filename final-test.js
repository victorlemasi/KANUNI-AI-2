const https = require('https');
const fs = require('fs');
const path = require('path');

// Read API key from .env.local
let apiKey = '';
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_GENAI_API_KEY=([^\s]+)/);
    if (match) apiKey = match[1];
}

if (!apiKey) {
    console.error("API Key not found");
    process.exit(1);
}

function testModel(modelId) {
    return new Promise((resolve) => {
        const body = JSON.stringify({
            contents: [{ parts: [{ text: "hi" }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const req = https.request({
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        }, (res) => {
            let data = '';
            res.on('data', (d) => data += d);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`SUCCESS: ${modelId} supports JSON on v1beta`);
                } else {
                    console.log(`FAILED: ${modelId} - Status ${res.statusCode}: ${data}`);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`Error testing ${modelId}:`, e.message);
            resolve();
        });

        req.write(body);
        req.end();
    });
}

async function run() {
    const models = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash-lite-001",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-2.0-flash"
    ];
    for (const m of models) {
        await testModel(m);
    }
}

run();
