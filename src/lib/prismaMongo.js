import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

export const prismaMongo = globalForPrisma.prismaMongo || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaMongo = prismaMongo