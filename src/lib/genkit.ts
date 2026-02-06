import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            apiVersion: "v1", // Stable models like 1.5 Flash require or prefer the v1 endpoint
        })
    ],
    // Switching to the latest stable 1.5 Flash
    model: "googleai/gemini-1.5-flash-latest",
});

export { z };
