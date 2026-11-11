require('dotenv/config');

async function main() {
  let prisma;
  try {
    const db = require('../src/config/prisma');
    prisma = db.prisma;

    await db.checkDatabaseConnection();
    const [{ current_database: database, version }] =
      await prisma.$queryRaw`SELECT current_database(), version()`;
    console.log(`Connected to PostgreSQL database "${database}".`);
    console.log(version);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main();
