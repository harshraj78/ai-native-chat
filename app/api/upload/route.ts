
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { pinecone, INDEX_NAME } from '@/lib/pinecone';
import { embeddings } from '@/lib/google-ai';
import { parsePDF } from '@/lib/pdf-loader';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { checkSubscription } from '@/lib/subscription';

import { storage } from '@/lib/storage';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    let step = 'init';
    try {
        const { userId } = await auth();
        console.log("DEBUG: Auth success", userId);

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // --- USER SYNC (Fix for 500 ForeignKey Error) ---
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });
        if (!dbUser) {
            console.log("DEBUG: Syncing User to DB...");
            try {
                dbUser = await prisma.user.create({
                    data: {
                        clerkId: userId,
                        email: `sync-${userId}@example.com`,
                    }
                });
            } catch (userErr: any) {
                console.error("DEBUG: Failed to sync user:", userErr);
                // If race condition where it was just created, try finding again
                dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
                if (!dbUser) throw new Error("User sync failed");
            }
        }
        // ------------------------------------------------

        step = 'subscription_check';
        const isPro = await checkSubscription();
        if (!isPro) {
            return new NextResponse("Pro subscription required", { status: 403 });
        }

        step = 'form_data';
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 0. Save File to Storage (New Step)
        step = 'file_save';
        let pdfUrl = '';
        try {
            pdfUrl = await storage.upload(file);
            console.log("DEBUG: File saved at", pdfUrl);
        } catch (e: any) {
            console.error("DEBUG: File save failed", e);
            // Proceeding without saving file for now if it fails, or throw?
            // detailed flow: strict fail if storage fails
            throw new Error(`File storage failed: ${e.message}`);
        }

        // 1. Convert File to Buffer and parse text
        step = 'pdf_parse';
        let pages: { page: number; content: string }[] = [];
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            pages = await parsePDF(buffer);
        } catch (e: any) {
            throw new Error(`PDF Parsing failed: ${e.message}`);
        }

        // 2. Split text into chunks (PER PAGE)
        step = 'text_split';
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        let allDocs: any[] = [];

        for (const page of pages) {
            const pageDocs = await splitter.createDocuments([page.content], [{
                source: file.name,
                page: page.page // ACUAL PAGE NUMBER
            }]);
            allDocs.push(...pageDocs);
        }

        // 3. Generate embeddings
        step = 'embeddings';
        let vectors;
        try {
            // Batch embed all chunks
            const chunks = allDocs.map(d => d.pageContent);
            const embeddingsBatch = await embeddings.embedDocuments(chunks);

            vectors = allDocs.map((doc, i) => {
                // Ensure metadata is flat and compatible with Pinecone
                const metadata = {
                    text: doc.pageContent,
                    source: file.name,
                    page: doc.metadata.page, // Use the page from metadata
                    userId,
                };

                return {
                    id: `${file.name}-${i}-${Date.now()}`,
                    values: embeddingsBatch[i],
                    metadata,
                };
            });

        } catch (e: any) {
            throw new Error(`Embedding Generation failed (Google AI): ${e.message}`);
        }

        // 4. Upsert to Pinecone
        step = 'pinecone_upsert';
        try {
            const index = pinecone.Index(INDEX_NAME);
            const batchSize = 100;
            for (let i = 0; i < vectors.length; i += batchSize) {
                const batch = vectors.slice(i, i + batchSize);
                await index.upsert(batch);
            }
        } catch (e: any) {
            throw new Error(`Pinecone Upsert failed: ${e.message}`);
        }

        // 5. Create Chat Session
        step = 'db_create';
        const chat = await prisma.chat.create({
            data: {
                name: file.name,
                userId,
                pdfName: file.name,
                pdfUrl: pdfUrl, // Saving the URL
            }
        });

        return NextResponse.json({
            success: true,
            chatId: chat.id,
            message: `Processed ${allDocs.length} chunks from ${file.name}`
        });

    } catch (error: any) {
        console.error(`Upload error at step [${step}]:`, error);

        return NextResponse.json({
            error: 'Upload Failed',
            details: error.message || `Unknown error at ${step}`
        }, { status: 500 });
    }
}
