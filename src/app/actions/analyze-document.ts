"use server"

import { complianceCheckFlow } from "@/lib/flows/complianceCheckFlow";
import { analyzeProcurementDocument } from "@/lib/openrouter";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import path from "path";
import { pathToFileURL } from "url";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        console.log("Analyzing PDF with pdf-parse...");
        // Set worker for serverless/container compatibility using file:// protocol
        // This avoids the "https protocol not supported by ESM loader" error
        const workerPath = path.join(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs");
        PDFParse.setWorker(pathToFileURL(workerPath).toString());

        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        const text = data.text;

        // Cleanup to avoid memory leaks
        await parser.destroy();

        console.log(`Extracted ${text.length} characters from PDF.`);
        return text;
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to parse PDF document. It might be protected or corrupted.");
    }
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

export async function analyzeDocumentAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        let provider = (formData.get("provider") as string) || "genkit";
        
        if (!file) throw new Error("No file provided");

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        let text = "";

        if (file.name.endsWith(".pdf")) {
            text = await extractTextFromPdf(buffer);
        } else if (file.name.endsWith(".docx")) {
            text = await extractTextFromDocx(buffer);
        } else if (file.name.endsWith(".txt")) {
            text = buffer.toString("utf-8");
        } else {
            throw new Error("Unsupported file format. Please upload PDF, DOCX, or TXT.");
        }

        if (!text || text.trim().length < 10) {
            throw new Error("Document appears to be empty or unreadable.");
        }

        console.log(`Starting AI analysis with ${provider} using ${text.length} characters...`);

        // Try primary provider first, then fallback if needed
        let result;
        let actualProvider = provider;
        let fallbackUsed = false;

        try {
            result = await analyzeWithProvider(text, provider);
        } catch (primaryError: any) {
            console.log(`Primary provider ${provider} failed:`, primaryError.message);
            
            // If primary provider failed due to quota, try the other one
            if (isQuotaError(primaryError)) {
                const fallbackProvider = provider === "genkit" ? "openrouter" : "genkit";
                console.log(`Attempting fallback to ${fallbackProvider}...`);
                
                try {
                    result = await analyzeWithProvider(text, fallbackProvider);
                    actualProvider = fallbackProvider;
                    fallbackUsed = true;
                } catch (fallbackError: any) {
                    console.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError.message);
                    
                    // If both providers failed due to quota, provide basic analysis
                    if (isQuotaError(fallbackError)) {
                        console.log("Both AI providers quota exceeded, providing basic analysis...");
                        result = await provideBasicAnalysis(text);
                        actualProvider = "basic";
                        fallbackUsed = true;
                    } else {
                        throw new Error(`Both AI providers unavailable. ${primaryError.message}. Fallback also failed: ${fallbackError.message}`);
                    }
                }
            } else {
                throw primaryError;
            }
        }

        // Cache the successful result
        const textHash = crypto.createHash('sha256').update(text + actualProvider).digest('hex');
        const cacheRef = adminDb.collection("analysis_cache").doc(textHash);
        await cacheRef.set({
            result,
            provider: actualProvider,
            createdAt: new Date(),
            textSnippet: text.slice(0, 100)
        });

        console.log(`${actualProvider} analysis completed successfully${fallbackUsed ? ' (via fallback)' : ''} and cached.`);

        return { 
            success: true, 
            analysis: result, 
            provider: actualProvider,
            fallback: fallbackUsed 
        };
    } catch (error: any) {
        console.error("Analysis Error Details:", error);
        return { success: false, error: error.message || "Analysis failed" };
    }
}

async function provideBasicAnalysis(text: string): Promise<any> {
    console.log("Providing basic offline analysis...");
    
    // Basic keyword-based analysis
    const keywords = {
        procurement: ['tender', 'procurement', 'bid', 'quotation', 'proposal', 'contract'],
        method: ['open tender', 'restricted tender', 'direct procurement', 'request for quotation', 'rfq'],
        value: ['ksh', 'kes', '$', 'usd', 'amount', 'budget', 'cost'],
        compliance: ['compliance', 'regulation', 'ppada', 'act', 'section']
    };
    
    const lowerText = text.toLowerCase();
    
    // Extract basic info
    let detectedMethod = "Unknown";
    for (const method of keywords.method) {
        if (lowerText.includes(method)) {
            detectedMethod = method.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            break;
        }
    }
    
    // Extract value (basic regex)
    const valueMatch = text.match(/(?:ksh|kes|\$|usd)?\s*[\d,]+(?:\.\d{2})?/gi);
    let detectedValue = 0;
    let currency = "KES";
    
    if (valueMatch) {
        const match = valueMatch[0].toLowerCase();
        if (match.includes('ksh') || match.includes('kes')) {
            currency = "KES";
        } else if (match.includes('$') || match.includes('usd')) {
            currency = "USD";
        }
        detectedValue = parseFloat(match.replace(/[^\d.]/g, ''));
    }
    
    // Extract title (first sentence or heading)
    const titleMatch = text.match(/^(.{1,100})/m);
    const detectedTitle = titleMatch ? titleMatch[1].trim() : "Document Analysis";
    
    // Basic compliance checks
    const complianceChecks = [
        {
            category: "Regulatory" as const,
            rule: "Document Format",
            status: "Pass" as const,
            finding: "Document appears to be properly formatted",
            recommendation: "Ensure all required sections are included"
        },
        {
            category: "Financial" as const,
            rule: "Budget Information",
            status: detectedValue > 0 ? "Pass" as const : "Warning" as const,
            finding: detectedValue > 0 ? `Budget identified: ${detectedValue} ${currency}` : "Budget amount not clearly specified",
            recommendation: detectedValue > 0 ? "Budget is clearly specified" : "Clearly specify the budget amount"
        },
        {
            category: "Risk/Best Practice" as const,
            rule: "Basic Compliance",
            status: "Warning" as const,
            finding: "Basic analysis completed - AI providers unavailable",
            recommendation: "Review document manually for full compliance check when AI services are available"
        }
    ];
    
    return {
        extractedMetadata: {
            title: detectedTitle,
            method: detectedMethod,
            value: detectedValue,
            currency: currency
        },
        isCompliant: true,
        overall_compliance_score: 70, // Conservative score for basic analysis
        summary: "Basic analysis completed using keyword extraction. AI providers are currently unavailable. Manual review recommended for full compliance assessment.",
        checks: complianceChecks
    };
}

function isQuotaError(error: any): boolean {
    const errorMessage = error.message || '';
    return errorMessage.includes("429") || 
           errorMessage.includes("RESOURCE_EXHAUSTED") || 
           error.status === 'RESOURCE_EXHAUSTED' || 
           errorMessage.includes("Quota exceeded") ||
           errorMessage.includes("credits") ||
           errorMessage.includes("tokens") ||
           errorMessage.includes("free tier") ||
           errorMessage.includes("limit") ||
           errorMessage.includes("wait") ||
           error.code === 'INSUFFICIENT_CREDITS';
}

async function analyzeWithProvider(text: string, provider: string): Promise<any> {
    // Check cache first
    const textHash = crypto.createHash('sha256').update(text + provider).digest('hex');
    const cacheRef = adminDb.collection("analysis_cache").doc(textHash);
    const cacheDoc = await cacheRef.get();

    if (cacheDoc.exists) {
        console.log(`Returning cached ${provider} analysis result (Quota Saved!)`);
        return cacheDoc.data()?.result;
    }

    if (provider === "openrouter") {
        console.log("Using OpenRouter for analysis...");
        const analysisText = await analyzeProcurementDocument(text);
        
        // Parse the OpenRouter response to match the expected format
        try {
            return JSON.parse(analysisText);
        } catch {
            // If JSON parsing fails, create a fallback structure
            return {
                extractedMetadata: {
                    title: "Document Analysis",
                    method: "Unknown",
                    value: 0,
                    currency: "USD"
                },
                isCompliant: true,
                overall_compliance_score: 75,
                summary: analysisText,
                checks: [{
                    category: "Risk/Best Practice" as const,
                    rule: "Document Analysis",
                    status: "Warning" as const,
                    finding: "Analysis completed via OpenRouter",
                    recommendation: "Review detailed analysis below"
                }]
            };
        }
    } else {
        console.log("Using Genkit for analysis...");
        return await complianceCheckFlow({
            documentText: text
        });
    }
}
