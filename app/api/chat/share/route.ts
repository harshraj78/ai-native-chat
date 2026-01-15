import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { chatId } = body;

        if (!chatId) {
            return new NextResponse("Chat ID required", { status: 400 });
        }

        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
                userId,
            },
        });

        if (!chat) {
            return new NextResponse("Chat not found", { status: 404 });
        }

        // Generate shareId if not exists
        const shareId = chat.shareId || nanoid(10);
        // Toggle Sharing (or set to true explicitly if not toggling)
        // Basic implementation: Set shared = true if not shared. 
        // Or updated logic: accept "isShared" in body.

        // Let's assume this endpoint makes it shared if not, or returns existing share link.

        const updatedChat = await prisma.chat.update({
            where: {
                id: chatId,
                userId,
            },
            data: {
                isShared: true,
                shareId: shareId,
            },
        });

        return NextResponse.json({
            isShared: updatedChat.isShared,
            shareId: updatedChat.shareId,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${shareId}`
        });

    } catch (error) {
        console.error("SHARE Chat error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
