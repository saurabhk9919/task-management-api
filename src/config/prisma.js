const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and add your PostgreSQL connection string.'
  );
}

// Prisma 7 connects through a driver adapter instead of a bundled query engine.
const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
}

module.exports = { prisma, checkDatabaseConnection };
