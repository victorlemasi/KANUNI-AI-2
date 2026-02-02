import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { z } from "zod";

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
            complianceScore: z.number(),
            summary: z.string(),
            checks: z.array(z.object({
                rule: z.string(),
                status: z.enum(["Pass", "Fail", "Warning"]),
                finding: z.string(),
                recommendation: z.string(),
            })),
        }),
    },
    async (input) => {
        const response = await ai.generate({
            prompt: `You are a Senior Compliance Auditor for public procurement, specifically trained on the Uganda PPDA Act 2003 (Amended 2021) and the PPDA Regulations 2023/2024.
      
      Procurement Context: ${JSON.stringify(input.procurementData)}
      Document Content: ${input.documentText}
      
      Apply the following official rules/thresholds (Guideline 1 of 2024):
      1. **Micro Procurement**: Max UGX 5 Million (or 10M if delegated).
      2. **Restricted Bidding**: 
         - Supplies: UGX 5M to 200M. 
         - Works: UGX 200M to 400M.
      3. **Open Bidding**: Required for values exceeding Restricted Bidding thresholds.
      4. **Bidding Periods**: 
         - Open Domestic: 15 working days.
         - Open International: 20 working days.
      5. **Advance Payments**: Generally capped at 30% of contract price.
      6. **Local Content**: Check for 15% reservation for Women, Youth, and PWDs if applicable (for values < 30M).
      
      Tasks:
      1. Calculate an overall compliance score (0-100).
      2. Evaluate based on the thresholds above.
      3. For each check, provide a status (Pass/Fail/Warning), a finding from the text, and a recommendation.
      
      Return a structured JSON object matching the output schema.`,
        });

        return response.output() as any;
    }
);
