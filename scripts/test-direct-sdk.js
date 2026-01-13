
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load env
const fs = require('fs');
try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GOOGLE_API_KEY=(.*)/);
    if (match) process.env.GOOGLE_API_KEY = match[1].trim();
} catch (e) { }

async function testDirectSDK() {
    console.log("Testing Direct Google SDK...");
    console.log("Key available:", !!process.env.GOOGLE_API_KEY);

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        // Try the exact model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Generating content...");
        const result = await model.generateContent("Hello, strictly test.");
        const response = await result.response;
        const text = response.text();

        console.log("✅ Success:", text);

    } catch (e) {
        console.error("❌ Failed:", e);
    }
}

testDirectSDK();
