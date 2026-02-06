import { googleAI } from "@genkit-ai/google-genai";
import { genkit } from "genkit";

async function testPair(version: string, model: string) {
    const ai = genkit({
        plugins: [
            googleAI({
                apiKey: process.env.GOOGLE_GENAI_API_KEY,
                apiVersion: version
            })
        ]
    });
    try {
        console.log(`Testing ${version} with ${model}...`);
        await ai.generate({
            model: `googleai/${model}`,
            prompt: "Hi",
            output: { format: "json" }
        });
        console.log(`  SUCCESS: ${version} + ${model}`);
        return true;
    } catch (e: any) {
        console.log(`  FAILED: ${version} + ${model} - ${e.message}`);
        return false;
    }
}

async function run() {
    const versions = ["v1", "v1beta"];
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash-001", "gemini-1.5-flash-002"];

    for (const v of versions) {
        for (const m of models) {
            await testPair(v, m);
        }
    }
}

run();
