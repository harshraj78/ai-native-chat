import { PrismaClient } from '@prisma/client';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { checkSubscription } from '../lib/subscription'; // Ensure text-loader works

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Diagnostic ---');

    // 1. Test Database
    try {
        console.log('1. Testing Prisma (Database)...');
        await prisma.$connect();
        const userCount = await prisma.user.count();
        console.log(`✅ Database connected. User count: ${userCount}`);
    } catch (error: any) {
        console.error('❌ Database connection failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }

    // 2. Test Pinecone
    try {
        console.log('\n2. Testing Pinecone...');
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY || '',
        });
        const indexes = await pc.listIndexes();
        console.log('✅ Pinecone connected. Indexes:', indexes.indexes?.map(i => i.name));
    } catch (error: any) {
        console.error('❌ Pinecone connection failed:', error.message);
    }

    // 3. Test Google AI
    try {
        console.log('\n3. Testing Google AI Embeddings...');
        if (!process.env.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY missing");

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            modelName: "embedding-001",
            taskType: TaskType.RETRIEVAL_DOCUMENT,
        });

        const res = await embeddings.embedQuery("Hello world");
        console.log(`✅ Google AI connected. Embedding length: ${res.length}`);
    } catch (error: any) {
        console.error('❌ Google AI connection failed:', error.message);
    }

    console.log('\n--- Diagnostic Complete ---');
}

main();
