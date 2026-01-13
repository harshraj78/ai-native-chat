
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

async function verify() {
    console.log("Starting verification...");

    // 1. Verify Google Gemini
    try {
        console.log("Testing Gemini Embedding...");
        if (!process.env.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY missing");

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            modelName: "embedding-001",
            taskType: TaskType.RETRIEVAL_DOCUMENT,
        });

        const res = await embeddings.embedQuery("Hello world");
        console.log("✅ Gemini Embedding Success! Vector length:", res.length);
    } catch (e: any) {
        console.error("❌ Gemini Failed:", e.message);
    }

    // 2. Verify Pinecone
    try {
        console.log("\nTesting Pinecone Connection...");
        if (!process.env.PINECONE_API_KEY) throw new Error("PINECONE_API_KEY missing");

        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const indexName = process.env.PINECONE_INDEX_NAME || 'pdf-chat';

        console.log(`Describing index '${indexName}'...`);
        const description = await pc.describeIndex(indexName);
        console.log("✅ Pinecone Connection Success!");
        console.log("Index Status:", description.status);
        console.log("Index Host:", description.host);
    } catch (e: any) {
        console.error("❌ Pinecone Failed:", e.message);
    }
}

verify();
