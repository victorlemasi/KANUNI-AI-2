import { genkit, z } from "genkit";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai";

export const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
    model: "gemini-1.5-flash-latest",
});

export const complianceCheckFlow = ai.defineFlow(
    {
        name: "complianceCheckFlow",
        inputSchema: z.object({
            procurementData: z.any().optional(),
            documentText: z.string(),
        }),
        outputSchema: z.object({
            extractedMetadata: z.object({
                title: z.string().describe("The identified procurement title"),
                method: z.string().describe("The procurement method identified (e.g., Open Tender, RFQ)"),
                value: z.number().describe("The estimated contract value"),
                currency: z.string().describe("The currency code (e.g., KES, USD)"),
            }),
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
      
      Document Content: ${input.documentText}
      Existing Context: ${JSON.stringify(input.procurementData || {})}

      Tasks:
      1. **Extract Metadata**: Identify the Procurement Title, Method, Estimated Value, and Currency directly from the document. 
         - If the document is an RFQ, the method is "Request for Quotation".
         - If it mentions a public tender, it's "Open Tender".
         - If value is not found, use 0 but flag it in the summary.
      
      2. **Compliance Audit**: Review the document against these specific Kenyan rules:
         - **Local Preference**: Contracts < KES 1 Billion must be awarded exclusively to local firms (2024 Amendment).
         - **AGPO Reservation**: 30% of procurement budget must be reserved for Women, Youth, and PWDs (Section 157).
         - **Local Content**: Minimum of 40% local content requirement.
         - **Procurement Methods**: Open (> KES 3M), RFQ (< KES 3M), Low-Value (< KES 50k).
         - **Advance Payment**: Capped at 20% (Section 147-148).
         - **Declaration**: Must include a non-corruption declaration (Section 62).
      
      3. **Scoring**:
         - Calculate an overall compliance score (0-100).
         - For each check, provide status (Pass/Fail/Warning), finding from text, and recommendation.
      
      Return a structured JSON object matching the output schema.`,
        });

        return response.output() as any;
    }
);
