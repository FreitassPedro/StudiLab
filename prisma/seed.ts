import { prisma } from "@/lib/prisma";

async function main() { 
    

    console.log('✅ Database seeded successfully with imported data!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });