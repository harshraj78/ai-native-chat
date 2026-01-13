import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
    const { userId } = await auth();

    if (!userId) {
        return false;
    }

    const user = await prisma.user.findUnique({
        where: {
            clerkId: userId,
        },
        select: {
            isPro: true,
        },
    });

    if (!user) {
        return false;
    }

    // return user.isPro;
    return true; // DEBUG: Allow all uploads for testing
};
