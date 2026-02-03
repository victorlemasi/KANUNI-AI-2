const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    try {
        const envPath = path.resolve('.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const lines = envFile.split('\n');
        for (const line of lines) {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                process.env[key] = value;
            }
        }
    } catch (e) {
        console.log("Could not load .env.local", e.message);
    }
}

loadEnv();

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API Key found in .env.local");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Fetching models from:", url.replace(apiKey, "HIDDEN_KEY"));

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
        } else if (data.models) {
            let output = "Available Models:\n";
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    output += `Name: ${m.name}\n`;
                    output += `DisplayName: ${m.displayName}\n`;
                    output += `Version: ${m.version}\n`;
                    output += "---\n";
                }
            });
            fs.writeFileSync('safe_models.txt', output, 'utf8');
            console.log("Wrote models to safe_models.txt");
        } else {
            console.log("Unexpected response format:", data);
        }
    })
    .catch(err => console.error("Fetch error:", err));
