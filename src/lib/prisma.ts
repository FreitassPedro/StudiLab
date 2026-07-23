import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { prismaQueryInsights } from "@prisma/sqlcommenter-query-insights";

const connectionString = `${process.env.DIRECT_DATABASE_URL}`;

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    // Adiciona SQL comments às queries com: model, action e parameterized query shape.
    // Permite rastrear no Query Insights do Prisma Postgres qual action gerou cada SQL.
    // Útil para identificar queries lentas, duplicadas ou com full table scan.
    comments: [prismaQueryInsights()],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;