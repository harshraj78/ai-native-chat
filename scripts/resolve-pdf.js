
try {
    console.log("Resolving pdfjs-dist...");
    try {
        console.log("Main:", require.resolve('pdfjs-dist'));
    } catch (e) { console.log("Main not found"); }

    try {
        console.log("Legacy JS:", require.resolve('pdfjs-dist/legacy/build/pdf.js'));
    } catch (e) { console.log("Legacy JS not found"); }

    try {
        console.log("Build JS:", require.resolve('pdfjs-dist/build/pdf.js'));
    } catch (e) { console.log("Build JS not found"); }

    // Check files in node_modules/pdfjs-dist if possible
    const fs = require('fs');
    const path = require('path');
    try {
        const root = path.dirname(require.resolve('pdfjs-dist/package.json'));
        console.log("Root:", root);
        console.log("Files:", fs.readdirSync(root));
        if (fs.existsSync(path.join(root, 'legacy'))) {
            console.log("Legacy folder exists");
            console.log("Legacy/Build:", fs.readdirSync(path.join(root, 'legacy/build')));
        }
    } catch (e) { console.log("Could not list dir: " + e.message); }

} catch (e) {
    console.error("General Error:", e);
}
