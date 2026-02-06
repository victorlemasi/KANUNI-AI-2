import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            apiVersion: "v1beta", // Required for advanced features and reliable model resolution for 2.0
        })
    ],
    // Flash Lite is the most quota-efficient model that supports JSON schema on v1beta
    model: "googleai/gemini-2.0-flash-lite",
});

export { z };
