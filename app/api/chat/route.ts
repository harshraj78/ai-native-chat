import { NextRequest, NextResponse } from 'next/server';
import { pinecone, INDEX_NAME } from '@/lib/pinecone';
import { embeddings } from '@/lib/google-ai';
import { GoogleGenerativeAI } from "@google/generative-ai"; // Direct SDK
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { checkSubscription } from '@/lib/subscription';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { message, chatId } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Sync User
        console.log("DEBUG [Chat]: Syncing user...");
        try {
            await prisma.user.upsert({
                where: { clerkId: userId },
                update: {},
                create: {
                    clerkId: userId,
                    email: user.emailAddresses[0].emailAddress,
                }
            });
        } catch (e: any) {
            console.error("DEBUG [Chat]: DB User Sync Failed", e);
            // Continue, strictly speaking might fail later but let's try
        }

        // 2. Check Subscription
        const isPro = await checkSubscription();
        if (!isPro) {
            return new NextResponse("Pro subscription required", { status: 403 });
        }

        // 3. Find or Create Chat
        console.log("DEBUG [Chat]: Finding/Creating chat for ID:", chatId);
        let chat;
        if (chatId) {
            chat = await prisma.chat.findUnique({
                where: { id: chatId, userId }
            });
        }

        if (!chat) {
            console.log("DEBUG [Chat]: Creating new chat record");
            chat = await prisma.chat.create({
                data: {
                    name: message.substring(0, 50),
                    userId,
                }
            });
        }

        // 4. Save User Message
        console.log("DEBUG [Chat]: Saving user message");
        await prisma.message.create({
            data: {
                role: 'user',
                content: message,
                chatId: chat.id,
            }
        });

        // 5. Embed & Query
        console.log("DEBUG [Chat]: Embedding message via Google...");
        const vector = await embeddings.embedQuery(message);

        console.log("DEBUG [Chat]: Querying Pinecone...");
        const index = pinecone.Index(INDEX_NAME);

        const filter: any = { userId };
        if (chat.pdfName) {
            filter.source = chat.pdfName;
        }

        const queryResponse = await index.query({
            vector,
            topK: 5,
            includeMetadata: true,
            filter,
        });

        const context = queryResponse.matches
            .map((match) => (match.metadata as any).text)
            .join('\n\n---\n\n');

        console.log("DEBUG [Chat]: Context found (" + queryResponse.matches.length + " chunks)");

        // 6. Generate response via Direct SDK
        console.log("DEBUG [Chat]: Calling Gemini via Direct SDK...");

        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("GOOGLE_API_KEY is missing");
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        // Using verified working model from Model Hunter script
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are an intelligent AI assistant. Your role is to analyze the provided PDF context and answer the user's question.

        Context from PDF:
        ${context}

        User Question:
        ${message}

        Instructions:
        1. Use the provided context to answer the question.
        2. If the user asks for an opinion (e.g., "is this good?"), provide a constructive analysis based on the content found in the context.
        3. Do not be overly restrictive. If the answer can be inferred from the context, do so.
        4. If the context contains a resume, analyze it as a professional recruiter would.
        5. Only say "I don't have enough information" if the context is completely irrelevant to the question.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        console.log("DEBUG [Chat]: Gemini response received");

        // 7. Save AI Message
        await prisma.message.create({
            data: {
                role: 'assistant',
                content: response,
                chatId: chat.id,
            }
        });

        return NextResponse.json({ response, chatId: chat.id });

    } catch (error: any) {
        console.error('DEBUG [Chat]: CRITICAL ERROR:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
