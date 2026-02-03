import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            // Removing explicit apiVersion to allow plugin to select correct endpoint (likely v1beta for these new models)
        })
    ],
    // Using 2.0 Flash-Lite as 1.5 is missing and 2.0 Flash hit quota limits
    model: "googleai/gemini-2.0-flash-lite-001",
});

export { z };
