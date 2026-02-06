"use server"

import { complianceCheckFlow } from "@/lib/flows/complianceCheckFlow";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import path from "path";
import { pathToFileURL } from "url";

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

        console.log(`Starting AI compliance flow with ${text.length} characters...`);
        const result = await complianceCheckFlow({
            documentText: text
        });
        console.log("Compliance flow completed successfully.");

        return { success: true, analysis: result };
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
