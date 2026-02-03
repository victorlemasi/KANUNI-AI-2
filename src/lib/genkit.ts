import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
        })
    ],
    // Switching back to Gemini 1.5 Flash for better free tier support
    model: "googleai/gemini-1.5-flash",
});

export { z };
