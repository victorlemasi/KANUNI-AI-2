import { ai, z } from "@/lib/genkit";

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
            overall_compliance_score: z.number(),
            summary: z.string(),
            checks: z.array(z.object({
                category: z.enum(["Regulatory", "Financial", "Risk/Best Practice"]),
                rule: z.string(),
                status: z.enum(["Pass", "Fail", "Warning"]),
                finding: z.string(),
                recommendation: z.string(),
            })),
        }),
    },
    async (input) => {
        const { output } = await ai.generate({
            prompt: `You are a Senior Strategic Procurement Consultant and Compliance Auditor. 
      Your audit must be comprehensive, covering regulatory compliance, financial feasibility, and global best practices.
      
      Primary Framework: Kenyan Public Procurement and Asset Disposal Act (PPADA) 2015 (Rev. 2022) and the 2024 Amendments.
      Extended Framework: ISO 20400 (Sustainable Procurement), Generally Accepted Accounting Principles (GAAP) for financial feasibility, and modern Risk Management standards.
      
      Document Content: ${input.documentText.slice(0, 15000)}
      Existing Context: ${JSON.stringify(input.procurementData || {})}

      Tasks:
      1. **Extract Metadata**: Identify the Procurement Title, Method, Estimated Value, and Currency directly from the document. 
         - If the document is an RFQ, the method is "Request for Quotation".
         - If it mentions a public tender, it's "Open Tender".
         - If value is not found, use 0 but flag it in the summary.
      
      2. **Multi-Dimensional Audit**: Review the document against these categories:
         - **Regulatory (PPADA)**: 
            - Local Preference (Contracts < KES 1B for local firms).
            - AGPO Reservation (30% for Women/Youth/PWDs).
            - Local Content (Min 40%).
            - Advance Payment (Capped at 20%).
            - Non-corruption declaration (Section 62).
         - **Financial Feasibility**: 
            - Are payment terms clearly defined and market-standard?
            - Is there a clear budget breakdown or pricing structure?
            - Are there any hidden costs or financial risks?
         - **Global Best Practices & Risk**:
            - Ethical sourcing and sustainability (ISO 20400).
            - Clarity of Technical Specifications/Terms of Reference.
            - Identification of high-risk legal/commercial clauses (e.g., unfair termination, indemnity).
      
      3. **Scoring & Categorization**:
         - Calculate an overall_compliance_score (0-100) reflecting all dimensions.
         - For each check, provide:
           - **category**: Must be exactly one of "Regulatory", "Financial", or "Risk/Best Practice".
           - **rule**: The specific rule or standard being checked.
           - **status**: Pass/Fail/Warning.
           - **finding**: Evidence from the text.
           - **recommendation**: Actionable advice.
      
      CRITICAL: You MUST categorize EVERY check correctly. PPADA items are "Regulatory". Payment/Budget items are "Financial". Everything else is "Risk/Best Practice".`,
            output: {
                schema: z.object({
                    extractedMetadata: z.object({
                        title: z.string(),
                        method: z.string(),
                        value: z.number(),
                        currency: z.string(),
                    }),
                    isCompliant: z.boolean(),
                    overall_compliance_score: z.number(),
                    summary: z.string(),
                    checks: z.array(z.object({
                        category: z.enum(["Regulatory", "Financial", "Risk/Best Practice"]),
                        rule: z.string(),
                        status: z.enum(["Pass", "Fail", "Warning"]),
                        finding: z.string(),
                        recommendation: z.string(),
                    })),
                })
            },
        });

        return output as any;
    }
);
