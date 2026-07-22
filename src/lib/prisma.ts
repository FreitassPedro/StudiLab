import "dotenv/config";
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from "@/app/generated/prisma/client";

const databaseURL = `${process.env.DATABASE_URL}`
const prismaClientSingleton = () => {
  return new PrismaClient({ accelerateUrl: databaseURL }).$extends(withAccelerate()) as unknown as PrismaClient;
};

declare global {
  var prismaGlobal: undefined | PrismaClient;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;