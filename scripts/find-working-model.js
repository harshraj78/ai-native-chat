
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

// Load env
try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GOOGLE_API_KEY=(.*)/);
    if (match) process.env.GOOGLE_API_KEY = match[1].trim();
} catch (e) { }

async function findWorkingModel() {
    console.log("🔍 Model Hunter (Gemini Only)...");

    // 1. Get List
    const fetch = require('node-fetch'); // or global fetch
    const fetchFn = (typeof fetch !== 'undefined') ? fetch : require('node-fetch');

    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`;
        const listResp = await fetchFn(listUrl);
        if (!listResp.ok) return;

        const listData = await listResp.json();
        const models = listData.models || [];

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        for (const m of models) {
            if (!m.name.includes("gemini")) continue;
            if (!m.supportedGenerationMethods.includes("generateContent")) continue;

            const rawName = m.name;
            const shortName = rawName.replace('models/', '');

            console.log(`Testing: ${shortName}...`);

            const candidates = [
                { model: shortName },
                { model: rawName }
            ];

            for (const conf of candidates) {
                try {
                    const model = genAI.getGenerativeModel(conf);
                    const res = await model.generateContent("Test");
                    const txt = res.response.text();
                    if (txt) {
                        console.log(`✅ SUCCESS: "${conf.model}"`);
                        fs.writeFileSync('working_model.txt', conf.model);
                        process.exit(0);
                    }
                } catch (e) { }
            }
        }
    } catch (e) {
        console.error("Fatal Error:", e);
    }
}

findWorkingModel();
