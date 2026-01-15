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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { chatId } = await params;
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const chat = await prisma.chat.update({
            where: {
                id: chatId,
                userId,
            },
            data: {
                name,
            },
        });

        return NextResponse.json(chat);
    } catch (error) {
        console.error("PATCH Chat error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { chatId } = await params;

        // Verify chat belongs to user
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
                userId,
            },
        });

        if (!chat) {
            return new NextResponse("Chat not found", { status: 404 });
        }

        await prisma.chat.delete({
            where: {
                id: chatId,
            },
        });

        return new NextResponse("Chat deleted", { status: 200 });
    } catch (error) {
        console.error("DELETE Chat error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
