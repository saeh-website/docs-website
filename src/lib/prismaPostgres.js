import { PrismaClient } from "../generated/postgres";

let prismaPostgres;

if (process.env.NODE_ENV === "production") {
  prismaPostgres = new PrismaClient();
} else {
  if (!global.prismaPostgres) {
    global.prismaPostgres = new PrismaClient();
  }
  prismaPostgres = global.prismaPostgres;
}

export { prismaPostgres };
