import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            apiVersion: "v1beta", // v1beta is required for responseMimeType (JSON schema) support on Gemini 1.5
        })
    ],
    // Switching to stable 1.5 Flash for better free tier quota
    model: "googleai/gemini-1.5-flash",
});

export { z };
