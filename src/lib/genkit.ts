import { genkit, z } from "genkit";
import { googleAI, gemini20Flash } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
        })
    ],
    // Switching to Gemini 2.0 Flash as requested
    model: gemini20Flash,
});

export { z };
