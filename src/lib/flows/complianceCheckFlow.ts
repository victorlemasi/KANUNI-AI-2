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
            prompt: `You are a Senior Compliance Auditor for public procurement in Kenya. 
      Your audit must be based on the **Public Procurement and Asset Disposal Act (PPADA) 2015 (Rev. 2022)** and the **2024 Amendments**.
      
      Procurement Context: ${JSON.stringify(input.procurementData)}
      Document Content: ${input.documentText}
      
      Review the document against these specific Kenyan rules:
      1. **Local Preference**: Contracts < KES 1 Billion must be awarded exclusively to local firms (2024 Amendment).
      2. **AGPO Reservation**: 30% of procurement budget must be reserved for Women, Youth, and PWDs (Section 157).
      3. **Local Content**: Minimum of 40% local content requirement for goods/services.
      4. **Procurement Methods**:
         - Open Tendering: Preferred method for all standard procurements.
         - Request for Quotations (RFQ): Generally up to KES 3 Million.
         - Restricted Tendering: Only for specialized/complex items with limited suppliers.
         - Low-Value Procurement: Up to KES 50,000.
      5. **Advance Payment**: Generally capped at 20% (Section 147-148).
      6. **Conflict of Interest**: Strict disclosure required (Section 66).
      7. **Declaration**: Must include a non-corruption declaration (Section 62).
      
      Tasks:
      1. Calculate an overall compliance score (0-100).
      2. Check if the procurement method aligns with the thresholds.
      3. Verify if AGPO or Local Preference rules are applied if applicable.
      4. For each check, provide a status (Pass/Fail/Warning), a finding from the text, and a recommendation based on the Kenya PPADA.
      
      Return a structured JSON object matching the output schema.`,
        });

        return response.output() as any;
    }
);
