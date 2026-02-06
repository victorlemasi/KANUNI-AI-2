"use server"

import { complianceCheckFlow } from "@/lib/flows/complianceCheckFlow";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        console.log("Analyzing PDF with pdf-parse...");
        const data = await PDFParse(buffer);
        console.log(`Extracted ${data.text.length} characters from PDF.`);
        return data.text;
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
        // Provide more user-friendly error messages
        const message = error.message?.includes("Quota exceeded")
            ? "AI model quota exceeded. Please try again in 1 minute."
            : error.message || "An unexpected error occurred during analysis.";

        return { success: false, error: message };
    }
}
