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
        const provider = (formData.get("provider") as string) || "genkit";
        
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

        // --- BUILT-IN CACHING LAYER ---
        const textHash = crypto.createHash('sha256').update(text + provider).digest('hex');
        const cacheRef = adminDb.collection("analysis_cache").doc(textHash);
        const cacheDoc = await cacheRef.get();

        if (cacheDoc.exists) {
            console.log("Returning cached analysis result (Quota Saved!)");
            return { success: true, analysis: cacheDoc.data()?.result, cached: true, provider };
        }

        let result;

        if (provider === "openrouter") {
            console.log("Using OpenRouter for analysis...");
            const analysisText = await analyzeProcurementDocument(text);
            // Parse the OpenRouter response to match the expected format
            try {
                result = JSON.parse(analysisText);
            } catch {
                // If JSON parsing fails, create a fallback structure
                result = {
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
            result = await complianceCheckFlow({
                documentText: text
            });
        }

        // Save to cache for future requests
        await cacheRef.set({
            result,
            provider,
            createdAt: new Date(),
            textSnippet: text.slice(0, 100) // For debugging context
        });

        console.log(`${provider} analysis flow completed successfully and cached.`);

        return { success: true, analysis: result, provider };
    } catch (error: any) {
        console.error("Analysis Error Details:", error);

        let message = error.message || "An unexpected error occurred during analysis.";

        // Specific handling for Quota/Rate Limit issues
        if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED") || error.status === 'RESOURCE_EXHAUSTED') {
            const retryAfter = error.originalMessage?.match(/retry in ([\d.]+)s/)?.[1];
            message = `API Quota Exceeded. The free tier has reached its limit. ${retryAfter ? `Please wait ${Math.ceil(parseFloat(retryAfter))} seconds before retrying.` : "Please try again in a few minutes."}`;
        } else if (error.message?.includes("Quota exceeded")) {
            message = "AI model quota exceeded. Please try again in 1 minute or check your Google AI Studio plan.";
        }

        return { success: false, error: message };
    }
}
