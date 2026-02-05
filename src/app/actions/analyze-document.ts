"use server"

import { complianceCheckFlow } from "@/lib/flows/complianceCheckFlow";
// @ts-ignore
import PDFParser from "pdf2json";
import mammoth from "mammoth";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    const pdfParser = new PDFParser(null, 1); // 1 = text only

    return new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            // pdf2json returns URL-encoded text
            const rawText = pdfParser.getRawTextContent();
            resolve(rawText);
        });

        pdfParser.parseBuffer(buffer);
    });
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

        const result = await complianceCheckFlow({
            documentText: text
        });

        return { success: true, analysis: result };
    } catch (error: any) {
        console.error("Analysis Error:", error);
        return { success: false, error: error.message };
    }
}
