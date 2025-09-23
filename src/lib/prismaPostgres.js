import { PrismaClientPostgres as PrismaClient } from './prisma-clients.js'

const globalForPrisma = global

export const prismaPostgres = globalForPrisma.prismaPostgres || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaPostgres = prismaPostgres