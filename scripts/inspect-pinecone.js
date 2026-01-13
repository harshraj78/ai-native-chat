
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function inspect() {
    console.log("Inspecting Pinecone Index (ESM import)...");

    try {
        const { Pinecone } = await import('@pinecone-database/pinecone');

        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const indexName = process.env.PINECONE_INDEX_NAME || 'pdf-chat';
        const index = pc.Index(indexName);

        // 1. Get Stats
        const stats = await index.describeIndexStats();
        console.log("Index Stats:", stats);

        // 2. Query
        // embedding-001 is 768 dimensions
        const dummyVector = new Array(768).fill(0.01);

        const query = await index.query({
            vector: dummyVector,
            topK: 5,
            includeMetadata: true
        });

        console.log("\nSample Vectors:");
        query.matches.forEach((m, i) => {
            console.log(`\n[${i}] Score: ${m.score.toFixed(4)} / ID: ${m.id}`);
            console.log(`SOURCE: ${m.metadata ? m.metadata.source : 'N/A'}`);

            const text = m.metadata ? m.metadata.text : null;
            if (text) {
                console.log(`TEXT PREVIEW: ${text.substring(0, 100).replace(/\n/g, ' ')}...`);
            } else {
                console.log("❌ NO TEXT METADATA FOUND");
            }
        });

    } catch (e) {
        console.error("Script Error:", e);
    }
}

inspect();
