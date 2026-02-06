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
                    throw new Error(`Both AI providers unavailable. ${primaryError.message}. Fallback also failed: ${fallbackError.message}`);
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

function isQuotaError(error: any): boolean {
    return error.message?.includes("429") || 
           error.message?.includes("RESOURCE_EXHAUSTED") || 
           error.status === 'RESOURCE_EXHAUSTED' || 
           error.message?.includes("Quota exceeded") ||
           error.message?.includes("credits") ||
           error.message?.includes("tokens");
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
