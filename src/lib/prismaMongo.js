import { PrismaClientMongo as PrismaClient } from './prisma-clients.js'

const globalForPrisma = global

export const prismaMongo = globalForPrisma.prismaMongo || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaMongo = prismaMongo