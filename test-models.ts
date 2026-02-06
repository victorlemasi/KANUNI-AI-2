import { googleAI } from "@genkit-ai/google-genai";
import { genkit } from "genkit";

const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
        })
    ]
});

async function test() {
    try {
        console.log("Testing gemini-1.5-flash with default settings...");
        const response = await ai.generate({
            model: "googleai/gemini-1.5-flash",
            prompt: "Say hi",
            output: { format: "json" }
        });
        console.log("Success with default!");
    } catch (e: any) {
        console.error("Default failed:", e.message);
    }

    try {
        console.log("\nTesting gemini-1.5-flash-002 with default settings...");
        const response = await ai.generate({
            model: "googleai/gemini-1.5-flash-002",
            prompt: "Say hi",
            output: { format: "json" }
        });
        console.log("Success with -002!");
    } catch (e: any) {
        console.error("-002 failed:", e.message);
    }
}

test();
