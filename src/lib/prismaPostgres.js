import { PrismaClient } from "@prisma/client";

let prismaPostgres;

if (process.env.NODE_ENV === "production") {
  prismaPostgres = new PrismaClient();
} else {
  // Prevent multiple instances during hot reloads in development
  if (!global.prismaPostgres) {
    global.prismaPostgres = new PrismaClient();
  }
  prismaPostgres = global.prismaPostgres;
}

export { prismaPostgres };
