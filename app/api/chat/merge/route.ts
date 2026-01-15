import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { sourceChatId, targetChatId } = body;

        if (!sourceChatId || !targetChatId) {
            return new NextResponse("Source and Target Chat IDs required", { status: 400 });
        }

        if (sourceChatId === targetChatId) {
            return new NextResponse("Cannot merge chat into itself", { status: 400 });
        }

        // Verify ownership
        const sourceChat = await prisma.chat.findUnique({ where: { id: sourceChatId, userId } });
        const targetChat = await prisma.chat.findUnique({ where: { id: targetChatId, userId } });

        if (!sourceChat || !targetChat) {
            return new NextResponse("Chat not found", { status: 404 });
        }

        // Move messages: Update chatId of all messages in source to target
        await prisma.message.updateMany({
            where: {
                chatId: sourceChatId,
            },
            data: {
                chatId: targetChatId,
            },
        });

        // Delete source chat? Or keep empty? 
        // User request "merge" usually implies consuming one into another.
        // Let's delete the source chat to prevent confusion/duplicates.
        await prisma.chat.delete({
            where: {
                id: sourceChatId,
            },
        });

        return NextResponse.json({ success: true, message: "Chats merged successfully" });

    } catch (error) {
        console.error("MERGE Chat error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
