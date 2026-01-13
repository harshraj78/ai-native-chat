
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Testing Database Connection...");
    try {
        await prisma.$connect();
        console.log("✅ Database Connected Successfully!");

        // Convert BigInt to string to avoid JSON serialization error in log
        const userCount = await prisma.user.count();
        console.log(`✅ Table 'User' access check: Found ${userCount} users.`);

    } catch (e) {
        console.error("❌ Database Connection Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
