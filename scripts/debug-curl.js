
const fs = require('fs');

// Load env
try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GOOGLE_API_KEY=(.*)/);
    if (match) process.env.GOOGLE_API_KEY = match[1].trim();
} catch (e) { }

async function testUrl(version, modelName) {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    console.log(`Testing: ${version} / ${modelName} ...`);

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });

        if (resp.ok) {
            console.log(`✅ SUCCESS! URL: ${url.replace(process.env.GOOGLE_API_KEY, 'API_KEY')}`);
            return true;
        } else {
            console.log(`❌ ${resp.status} ${resp.statusText}`);
            // console.log(await resp.text());
        }
    } catch (e) {
        console.log("❌ Error: " + e.message);
    }
    return false;
}

async function run() {
    const versions = ['v1beta', 'v1', 'v1alpha'];
    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-001',
        'gemini-pro',
        'models/gemini-1.5-flash'
    ];

    for (const v of versions) {
        for (const m of models) {
            if (await testUrl(v, m)) {
                // Determine we found a winner?
                // we can keep going to see all valid ones
            }
        }
    }
}

run();
