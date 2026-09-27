import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  binixPrisma: PrismaClient | undefined;
};

let prismaClient = globalForPrisma.binixPrisma;

export function getPrismaClient(): PrismaClient {
  if (prismaClient) {
    return prismaClient;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required when BINIX_DATA_DRIVER=database.",
    );
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  prismaClient = new PrismaClient({
    adapter,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.binixPrisma = prismaClient;
  }

  return prismaClient;
}