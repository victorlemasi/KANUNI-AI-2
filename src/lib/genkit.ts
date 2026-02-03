import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
        })
    ],
    // The google-genai plugin uses 'gemini-1.5-flash' but defaults to stable v1 if possible
    model: "googleai/gemini-1.5-flash",
});

export { z };
