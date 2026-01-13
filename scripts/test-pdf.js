
const pdf = require('pdf-parse');

async function testPdfParse() {
    console.log("Testing PDF Parse...");
    try {
        // Create a dummy PDF buffer (header only) to test basic import/functionality
        // This won't be a valid PDF but checks if the library loads and handles buffers without immediate crash
        const buffer = Buffer.from("%PDF-1.7\n%EOF");

        try {
            await pdf(buffer);
        } catch (e) {
            // We expect a parsing error on invalid PDF, but we want to ensure it doesn't CRASH the process or throw "module not found"
            if (e.message.includes("Invalid PDF structure") || e.name === "Error") {
                console.log("✅ pdf-parse loaded and ran (threw expected validation error for dummy file)");
            } else {
                throw e;
            }
        }
        console.log("✅ pdf-parse dependency check passed");
    } catch (e) {
        console.error("❌ pdf-parse verification failed:", e);
    }
}

testPdfParse();
