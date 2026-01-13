
// Use CommonJS require for pdfjs-dist v3 (Node.js compatible)

// Polyfill for Promise.withResolvers if missing (Node < 22)
if (typeof Promise.withResolvers === 'undefined') {
    // @ts-ignore
    global.Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

export async function parsePDF(buffer: Buffer): Promise<string> {
    try {
        console.log("DEBUG: Loading PDF via pdfjs-dist v3 (CommonJS)...");

        // Validated working path for pdfjs-dist@3.11.174 in Node.js
        const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

        // Load document
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            useSystemFonts: true,
            // Force disable worker to avoid external file dependency
            disableFontFace: true,
        });

        const doc = await loadingTask.promise;
        console.log("DEBUG: PDF Loaded. Pages:", doc.numPages);

        let fullText = '';

        for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const textContent = await page.getTextContent();

            // Extract strings and join them
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            fullText += pageText + ' ';

            // Release page resources
            if (page.cleanup) page.cleanup();
        }

        return fullText.trim();

    } catch (e: any) {
        console.error("PDF Parsing Error (pdfjs-dist v3):", e);
        throw new Error(`Failed to parse PDF: ${e.message}`);
    }
}
