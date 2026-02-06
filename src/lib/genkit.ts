import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            apiVersion: "v1", // Using stable v1 endpoint
        })
    ],
    // Using the versioned 001 model which is highly stable on the v1 API for structured output
    model: "googleai/gemini-1.5-flash-001",
});

export { z };
