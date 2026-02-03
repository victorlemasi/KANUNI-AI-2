import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
        })
    ],
    // Using string identifier to avoid export issues and target Gemini 2.0 Flash
    model: "googleai/gemini-2.0-flash",
});

export { z };
