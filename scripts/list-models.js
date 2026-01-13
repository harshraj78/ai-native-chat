
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Polyfill fetch if needed (Node 18+ has it native)
// const fetch = require('node-fetch'); 

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY || "YOUR_API_KEY_HERE"; // It will pick up from env if running via next or dotenv

    if (!process.env.GOOGLE_API_KEY) {
        console.error("GOOGLE_API_KEY is not set in environment.");
        // We will try to read from .env.local for convenience
        const fs = require('fs');
        try {
            const env = fs.readFileSync('.env.local', 'utf8');
            const match = env.match(/GOOGLE_API_KEY=(.*)/);
            if (match) {
                process.env.GOOGLE_API_KEY = match[1].trim();
                console.log("Loaded API Key from .env.local");
            }
        } catch (e) {
            console.log("Could not read .env.local");
        }
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    try {
        console.log("Fetching models...");
        // For google-generative-ai SDK
        // There isn't a direct "listModels" on the main class in some versions, 
        // usually it's a separate manager or via REST.
        // Let's rely on the error message suggestion which usually implies using the REST API or SDK method if available.
        // Actually, the SDK has `getGenerativeModel` directly. 
        // Let's try to just hit the REST API to be sure what is "available".

        const key = process.env.GOOGLE_API_KEY;
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await resp.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }

    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
