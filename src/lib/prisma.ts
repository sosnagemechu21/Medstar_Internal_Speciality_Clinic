import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Extend transaction timeout from default 5000ms to 15000ms
    // to accommodate remote latency over cloud poolers like Supabase.
    transactionOptions: {
      maxWait: 10000, // default 2000ms
      timeout: 15000, // default 5000ms 
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
