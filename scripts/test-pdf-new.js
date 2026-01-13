
const fs = require('fs');

async function testPDF() {
    console.log("Testing direct pdfjs-dist usage...");
    try {
        // Try to require standard build
        let pdfjsLib;
        try {
            pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
            console.log("✅ Loaded pdfjs-dist/legacy/build/pdf.js");
        } catch (e) {
            console.log("Legacy build not found, trying generic...");
            pdfjsLib = require('pdfjs-dist');
            console.log("✅ Loaded pdfjs-dist");
        }

        // Mock buffer
        const buffer = Buffer.from("%PDF-1.7\n%EOF");

        try {
            const loadingTask = pdfjsLib.getDocument({ data: buffer });
            const doc = await loadingTask.promise;
            console.log(`✅ Document loaded (numPages: ${doc.numPages})`);
        } catch (e) {
            if (e.name === 'InvalidPDFException' || e.message.includes('PDF')) {
                console.log("✅ pdfjs-dist attempted parse (threw expected invalid PDF error)");
            } else {
                throw e;
            }
        }

    } catch (e) {
        console.error("❌ pdfjs-dist failed:", e.message);
        console.error("Stack:", e.stack);
    }
}

testPDF();
