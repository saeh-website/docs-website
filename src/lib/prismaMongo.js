import { PrismaClient } from "@prisma/client"; // Use the standard Prisma client

let prismaMongo;

if (!global.prismaMongo) {
  prismaMongo = new PrismaClient({
    datasources: {
      db: {
        url: process.env.MONGODB_URL, // Must be set in Vercel environment variables
      },
    },
    log: ["query", "error", "warn"], // Optional, helpful for debugging
  });
  global.prismaMongo = prismaMongo;
} else {
  prismaMongo = global.prismaMongo;
}

export { prismaMongo };
