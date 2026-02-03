import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            // Explicitly requesting v1 to avoid beta endpoint issues
            apiVersion: "v1"
        })
    ],
    // Using the specific version -001 which is more reliable than the generic alias
    model: "googleai/gemini-1.5-flash-001",
});

export { z };
