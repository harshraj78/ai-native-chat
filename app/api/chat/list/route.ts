import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const chats = await prisma.chat.findMany({
            where: {
                userId,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                pdfName: true,
                createdAt: true,
            }
        });

        return NextResponse.json(chats);
    } catch (error) {
        console.error("GET Chat List error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
