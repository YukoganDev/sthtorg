import { PrismaClient } from '@prisma/client';

export let prisma: PrismaClient;

declare global {
  var _db: PrismaClient | undefined;
}

prisma = new PrismaClient();
prisma.$connect().catch(async (e) => {
  console.log(e);
  prisma.$disconnect().then(async () => {
    process.exit(1);
  });
});
