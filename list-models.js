const https = require('https');

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
    console.error("GOOGLE_GENAI_API_KEY not found in env");
    process.exit(1);
}

function fetchModels(version) {
    return new Promise((resolve, reject) => {
        https.get(`https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`--- Models for ${version} ---`);
                    if (json.models) {
                        json.models.forEach(m => {
                            if (m.name.includes("flash") || m.name.includes("lite")) {
                                console.log(`- ${m.name}`);
                            }
                        });
                    } else {
                        console.log("No models found or error:", data);
                    }
                    resolve();
                } catch (e) {
                    console.error(`Error parsing ${version} response:`, e.message);
                    resolve();
                }
            });
        }).on('error', (err) => {
            console.error(`Error fetching ${version}:`, err.message);
            resolve();
        });
    });
}

async function run() {
    await fetchModels('v1');
    console.log();
    await fetchModels('v1beta');
}

run();
