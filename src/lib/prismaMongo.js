import { PrismaClient } from "@prisma/client-mongo";

let prismaMongo;

if (!global.prismaMongo) {
  // In production, Prisma will pick the correct binary if binaryTargets are set in schema
  prismaMongo = new PrismaClient({
    log: ["query", "error", "warn"], // optional: helpful for debugging in production
  });
  global.prismaMongo = prismaMongo;
} else {
  prismaMongo = global.prismaMongo;
}

export { prismaMongo };
