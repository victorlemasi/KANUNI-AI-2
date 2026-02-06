import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            apiVersion: "v1beta", // Required for advanced features and reliable model resolution for 2.0
        })
    ],
    // 2.0 Flash Lite is extremely quota-friendly and supports structured JSON perfectly
    model: "googleai/gemini-2.0-flash-lite-preview-02-05",
});

export { z };
