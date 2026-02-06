const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

    try {
        console.log("Listing models via @google/generative-ai...");
        // The SDK doesn't have a direct listModels but we can try to initialize and check
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Model 'gemini-1.5-flash' initialized successfully (SDK-side).");

        // Attempt a real call with a tiny prompt to check responseMimeType support
        console.log("Testing gemini-1.5-flash with JSON schema...");
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        console.log("SUCCESS: gemini-1.5-flash supports JSON schema on current default endpoint.");
    } catch (e) {
        console.log("FAILED gemini-1.5-flash:", e.message);

        try {
            console.log("Testing gemini-1.5-flash-002...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
            await model2.generateContent("hi");
            console.log("SUCCESS: gemini-1.5-flash-002 is available.");
        } catch (e2) {
            console.log("FAILED gemini-1.5-flash-002:", e2.message);
        }

        try {
            console.log("Testing gemini-2.0-flash-lite...");
            const model3 = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
            await model3.generateContent("hi");
            console.log("SUCCESS: gemini-2.0-flash-lite-preview-02-05 is available.");
        } catch (e3) {
            console.log("FAILED gemini-2.0-flash-lite:", e3.message);
        }
    }
}

run();
