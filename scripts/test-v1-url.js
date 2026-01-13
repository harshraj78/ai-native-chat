
const fs = require('fs');

// Load env
try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GOOGLE_API_KEY=(.*)/);
    if (match) process.env.GOOGLE_API_KEY = match[1].trim();
} catch (e) { }

async function testV1() {
    console.log("Testing v1 REST Endpoint...");
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello v1" }] }]
            })
        });

        if (resp.ok) {
            console.log("✅ v1 SUCCESS!");
            console.log(await resp.text());
        } else {
            console.log(`❌ v1 Failed: ${resp.status}`);
            console.log(await resp.text());
        }
    } catch (e) {
        console.log("❌ Error: " + e.message);
    }
}

testV1();
