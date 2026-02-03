import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
        })
    ],
    // Using string identifier as constants might be missing in some plugin versions
    model: "googleai/gemini-2.0-flash",
});

export { z };
