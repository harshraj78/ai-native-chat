// Run with: npx dotenv-cli -e .env.local -- npx tsx scripts/check-env.ts

const keys = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'DATABASE_URL',
    'PINECONE_API_KEY',
    'GOOGLE_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL'
];

console.log("\n--- Environment Variable Check ---");
keys.forEach(key => {
    const val = process.env[key];
    if (!val) {
        console.error(`❌ MISSING: ${key}`);
    } else {
        const display = val.length > 8 ? val.substring(0, 4) + '...' + val.substring(val.length - 4) : '****';
        console.log(`✅ FOUND: ${key} (${display})`);
    }
});
console.log("----------------------------------");
