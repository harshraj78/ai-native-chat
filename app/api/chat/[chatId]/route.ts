import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { chatId } = await params;

        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
                userId,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        if (!chat) {
            return new NextResponse("Chat not found", { status: 404 });
        }

        return NextResponse.json(chat);
    } catch (error) {
        console.error("GET Chat error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
