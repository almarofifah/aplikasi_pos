const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({ select: { id: true, username: true, email: true, passwordHash: true, role: true, createdAt: true } });
    console.log('USERS:', users);
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await new PrismaClient().$disconnect();
  }
}

main();
