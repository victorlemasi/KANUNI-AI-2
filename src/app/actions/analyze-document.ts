"use server"

import { complianceCheckFlow } from "@/lib/flows/complianceCheckFlow";
import { PdfReader } from "pdfreader";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        let text = "";
        new PdfReader().parseBuffer(buffer, (err, item) => {
            if (err) reject(err);
            else if (!item) resolve(text);
            else if (item.text) text += item.text + " ";
        });
    });
}

export async function analyzeDocumentAction(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        const text = await extractTextFromPdf(buffer);

        const procurementData = {
            title: formData.get("title") as string,
            value: Number(formData.get("value")),
            method: formData.get("method") as string,
        };

        const analysis = await complianceCheckFlow({
            procurementData,
            documentText: text,
        });

        return { success: true, analysis };
    } catch (error: any) {
        console.error("PDF Parsing Error:", error);
        return { success: false, error: error.message };
    }
}
