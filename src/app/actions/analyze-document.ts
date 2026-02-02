"use server"

import { complianceCheckFlow } from "@/lib/flows/complianceCheckFlow";

export async function analyzeDocumentAction(formData: FormData) {
    // Dynamically require pdf-parse to avoid build-time ESM/Turbopack issues
    const pdf = require("pdf-parse");
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        const data = await pdf(buffer);
        const text = data.text;

        // We can also pass procurement meta data if needed
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
