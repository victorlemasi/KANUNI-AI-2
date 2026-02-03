import { genkit } from "genkit";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai";
import { z } from "zod";

export const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
    model: gemini15Flash,
});

export const procurementRiskFlow = ai.defineFlow(
    {
        name: "procurementRiskFlow",
        inputSchema: z.object({
            title: z.string(),
            description: z.string(),
            procurementMethod: z.string(),
            value: z.number(),
            currency: z.string(),
            vendorId: z.string(),
            vendorHistory: z.string().optional(),
        }),
        outputSchema: z.object({
            riskScore: z.number().min(0).max(100),
            riskLevel: z.enum(["Low", "Medium", "High", "Critical"]),
            identifiedFactors: z.array(z.string()),
            aiExplanation: z.string(),
        }),
    },
    async (input) => {
        const response = await ai.generate({
            prompt: `You are a procurement risk expert. Analyze the following procurement data and assess its risk level.
      
      Procurement Title: ${input.title}
      Description: ${input.description}
      Method: ${input.procurementMethod}
      Value: ${input.value} ${input.currency}
      Vendor ID: ${input.vendorId}
      Vendor History: ${input.vendorHistory || "No history available"}
      
      Consider factors like:
      - Procurement method suitability for the value.
      - Vendor reliability and past performance.
      - Project complexity and duration.
      - Potential for fraud or collusion.
      
      Return a response that can be parsed as JSON matching the schema: { riskScore: number, riskLevel: string, identifiedFactors: string[], aiExplanation: string }`,
        });

        return response.output() as any;
    }
);
