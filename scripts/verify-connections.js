
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { TaskType } = require("@google/generative-ai");
const { Pinecone } = require('@pinecone-database/pinecone');

const GOOGLE_API_KEY = "AIzaSyBA-rmojdecVp24GMXGMBs6TO-qJJhndww";
const PINECONE_API_KEY = "pcsk_583sCt_BYFmCKu5mgC1s1sJfzVpxK1K8iNU5ZtrtG72KerVkWo9cE7AC6fvVJrFaMetLJ3";
const PINECONE_INDEX_NAME = "pdf-chat";

async function verify() {
    console.log("Starting robust verification...");

    // 1. Verify Pinecone (Usually faster/easier to check connectivity)
    try {
        console.log("Testing Pinecone Connection...");
        const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

        console.log(`Describing index '${PINECONE_INDEX_NAME}'...`);
        // Add timeout promise
        const pineconePromise = pc.describeIndex(PINECONE_INDEX_NAME);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Pinecone Timeout")), 5000));

        const description = await Promise.race([pineconePromise, timeoutPromise]);

        console.log("✅ Pinecone Connection Success!");
        console.log("Index Host:", description.host);
    } catch (e) {
        console.error("❌ Pinecone Failed:", e.message);
    }

    // 2. Verify Gemini
    try {
        console.log("\nTesting Gemini Embedding...");

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: GOOGLE_API_KEY,
            modelName: "text-embedding-004", // Newer model
            taskType: TaskType.RETRIEVAL_DOCUMENT,
        });

        // Add timeout
        const embedPromise = embeddings.embedQuery("Hello world");
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini Timeout")), 10000));

        const res = await Promise.race([embedPromise, timeoutPromise]);
        console.log("✅ Gemini Embedding Success! Vector length:", res.length);
    } catch (e) {
        console.error("❌ Gemini Failed:", e.message);
        if (e.message.includes("400")) console.log("Hint: Key might be invalid or model doesn't exist.");
        if (e.message.includes("403")) console.log("Hint: Key not enabled for this API.");
    }
}

verify();
