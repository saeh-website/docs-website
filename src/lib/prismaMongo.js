import { PrismaClient } from "@prisma/client-mongo";

let prismaMongo;

if (process.env.NODE_ENV === "production") {
  prismaMongo = new PrismaClient();
} else {
  if (!global.prismaMongo) global.prismaMongo = new PrismaClient();
  prismaMongo = global.prismaMongo;
}

export { prismaMongo };
