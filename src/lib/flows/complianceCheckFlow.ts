import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { z } from "zod";

// Re-using the same AI instance or initializing if needed
const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
    model: "gemini-1.5-flash",
});

export const complianceCheckFlow = ai.defineFlow(
    {
        name: "complianceCheckFlow",
        inputSchema: z.object({
            procurementData: z.any(),
            documentText: z.string(),
        }),
        outputSchema: z.object({
            isCompliant: z.boolean(),
            findings: z.array(z.string()),
        }),
    },
    async (input) => {
        const response = await ai.generate({
            prompt: `You are a compliance officer specializing in PPDA (Public Procurement and Disposal of Public Assets) and PFM (Public Financial Management) acts.
      
      Procurement Data: ${JSON.stringify(input.procurementData)}
      Document Text: ${input.documentText}
      
      Check for:
      1. Adherence to procurement value thresholds for the chosen method.
      2. Completeness of required documentation mentioned in the text.
      3. Compliance with eligibility criteria.
      
      Return a response that can be parsed as JSON: { isCompliant: boolean, findings: string[] }`,
        });

        return response.output() as any;
    }
);
