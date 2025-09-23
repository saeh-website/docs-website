import { PrismaClient } from '.prisma/client-postgres'

const globalForPrisma = global

export const prismaPostgres = globalForPrisma.prismaPostgres || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaPostgres = prismaPostgres