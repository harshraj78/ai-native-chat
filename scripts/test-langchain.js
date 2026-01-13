
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { PromptTemplate } = require("@langchain/core/prompts");

// Load env
const fs = require('fs');
try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GOOGLE_API_KEY=(.*)/);
    if (match) process.env.GOOGLE_API_KEY = match[1].trim();
} catch (e) { }

async function testLangChain() {
    console.log("Testing LangChain Gemini Integration...");
    console.log("Key available:", !!process.env.GOOGLE_API_KEY);

    try {
        // Try without 'models/' prefix and force v1beta
        console.log("Attempt 1: gemini-1.5-flash");
        const llm = new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
            modelName: "gemini-1.5-flash",
            apiVersion: "v1beta",
            maxOutputTokens: 2048,
        });

        const res = await llm.invoke("Hello, are you there?");
        console.log("✅ Success:", res.content);

    } catch (e) {
        console.error("❌ Attempt 1 Failed:", e.message);

        try {
            console.log("Attempt 2: models/gemini-1.5-flash-001");
            const llm2 = new ChatGoogleGenerativeAI({
                apiKey: process.env.GOOGLE_API_KEY,
                modelName: "models/gemini-1.5-flash-001",
                maxOutputTokens: 2048,
            });
            const res2 = await llm2.invoke("Hello 2?");
            console.log("✅ Success 2:", res2.content);
        } catch (e2) {
            console.error("❌ Attempt 2 Failed:", e2.message);
        }
    }
}

testLangChain();
