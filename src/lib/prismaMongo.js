import { PrismaClient } from '@prisma/client-mongo';

let prismaMongo;

if (process.env.NODE_ENV === 'production') {
  prismaMongo = new PrismaClient();
} else {
  // Prevent multiple instances during hot reloads in dev
  if (!global.prismaMongo) {
    global.prismaMongo = new PrismaClient();
  }
  prismaMongo = global.prismaMongo;
}

export { prismaMongo };
