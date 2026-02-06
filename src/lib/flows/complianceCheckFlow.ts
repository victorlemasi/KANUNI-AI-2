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
      
      Document Content: ${input.documentText.slice(0, 30000)}
      Existing Context: ${JSON.stringify(input.procurementData || {})}

      Tasks:
      1. **Extract Metadata**: Identify the Procurement Title, Method, Estimated Value, and Currency directly from the document. 
         - If the document is an RFQ, the method is "Request for Quotation".
         - If it mentions a public tender, it's "Open Tender".
         - If value is not found, use 0 but flag it in the summary.
      
      2. **Multi-Dimensional Audit**: Review the document against these SPECIFIC rules:
         - **Regulatory (PPADA 2015 & Regulations 2020)**: 
            - **Evaluation Stages**: Regulation 74 (Preliminary - Serialization, Bid Bonds), Reg 76 (Technical - Compliance with Specs), Reg 77 (Financial - Ranking/Market Comparison).
            - **Document Access**: Section 60(4) - Access and cost (Ksh 1000 cap or free download).
            - **Bid Bonds**: Requirements and acceptable forms (Reg 45 - Bank/Insurance/CBK licensed).
            - **Inclusivity (AGPO)**: Section 157 & Reg 143-165 - 30% reservation for Youth/Women/PWDs and unbundling for inclusivity (Reg 154).
            - **Local Industry**: Section 153 - Promotion of local content (Min 40% inputs - Reg 5(3)).
            - **Ethics**: Section 62 & Reg 47 - Declaration of non-corruption and non-collusion.
            - **Special Procedures**: Section 114A & Reg 107 - Specially Permitted Procurement (Treasury-approved).
            - **Contract Management**: Regulation 132 (Variations/Amendments) and Reg 150 (Prompt Payment for AGPO/Citizen firms).
         - **Financial Feasibility (GAAP/Finance Act)**: 
            - **Tax Compliance**: Finance Act 2017 - VAT exemptions (Hospital beds > 50, ISO Clean cookstoves, specialized agricultural inputs).
            - **Excise Duty**: biannual adjustments (every 2 years) for spirits, cigarettes, and petroleum.
            - **Remittance**: Withholding tax must be remitted by the 20th (10% late penalty - Reg 28 of Finance Act/Tax Procedures).
            - **Islamic Finance**: Recognition of Sukuk, Islamic finance arrangements, and property finance (Stamp Duty exemptions).
            - **Financial Standing**: Audited reports, working capital, banker references.
            - **Qualification Criteria**: Annual volume requirements (e.g., 2.5x estimate).
            - **Payment Terms**: Clarity of schedules, milestones, and retention money.
            - **Pricing**: Clear budget breakdown and Bills of Quantities (BOQ).
            - **Risks**: Identification of hidden costs or unforeseen financial obligations.
         - **Global Best Practices & Risk**:
            - **Experience**: Performance in similar works over last 5 years.
            - **Resources**: Availability of qualified personnel and essential equipment.
            - **Legal Safety**: Disclosure of litigation history and dispute profiles.
            - **Subcontracting**: Control and disclosure (limitations > 10% price).
            - **Partnerships**: Joint venture joint/several liability requirements.
            - **Sustainability**: ISO 20400 integration (Environmental/Social/Ethical).
            - **Clarity**: Precision of Technical Specifications and ToRs.
            - **Commercial Risks**: High-risk clauses (Termination, Indemnity, Liquidated Damages).
            - **Relevance**: Timeliness and market context of the tender process.
      
      3. **Scoring & Categorization**:
         - Calculate an overall_compliance_score (0-100) reflecting all dimensions.
         - For each check, provide:
           - **category**: Must be exactly one of "Regulatory", "Financial", or "Risk/Best Practice".
           - **rule**: The specific rule or standard being checked (use full names like "PPADA 2015, Section 157").
           - **status**: Pass/Fail/Warning.
           - **finding**: Evidence from the text.
           - **recommendation**: Actionable advice.
      
      CRITICAL: You MUST categorize EVERY check correctly. PPADA items are "Regulatory". Payment/Budget/Financial items are "Financial". Resources/Experience/Sustainability/Legal items are "Risk/Best Practice".`,
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
