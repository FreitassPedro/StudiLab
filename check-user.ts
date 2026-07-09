import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function run() {
    const u = await prisma.user.findFirst({include: {accounts: true}});
    console.log(JSON.stringify(u, null, 2));
}

run().finally(() => process.exit(0));
