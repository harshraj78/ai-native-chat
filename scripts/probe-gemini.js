
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load env
const fs = require('fs');
try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GOOGLE_API_KEY=(.*)/);
    if (match) process.env.GOOGLE_API_KEY = match[1].trim();
} catch (e) { }

async function probe() {
    console.log("Probing Gemini Models (Prioritizing v1beta)...");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // Try finding the specific model from list output first
    // gemini-1.5-flash

    // The SDK allows passing `apiVersion` in the getGenerativeModel config
    const configs = [
        { model: "gemini-1.5-flash", apiVersion: "v1beta" },
        { model: "models/gemini-1.5-flash", apiVersion: "v1beta" },
        { model: "gemini-1.5-flash" }, // Default (v1)
        { model: "gemini-pro" }
    ];

    for (const config of configs) {
        process.stdout.write(`Testing: ${JSON.stringify(config)} ... `);
        try {
            const model = genAI.getGenerativeModel(config);
            const result = await model.generateContent("Test.");
            const response = await result.response;
            console.log("✅ OK! Response: " + response.text().substring(0, 20));
            return; // EXIT ON FIRST SUCCESS
        } catch (e) {
            console.log("❌ Failed: " + e.message.split('\n')[0]);
        }
    }
}

probe();
