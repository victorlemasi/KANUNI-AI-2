import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            // Removing explicit apiVersion to allow plugin to select correct endpoint (likely v1beta for these new models)
        })
    ],
    // Switching to 1.5 Flash for better free tier quota and large context stability
    model: "googleai/gemini-1.5-flash",
});

export { z };
