const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { username: 'alma' } });
    if (!user) return console.log('User not found');
    const candidate = process.argv[2] || 'rahasia123';
    const match = await bcrypt.compare(candidate, user.passwordHash);
    console.log('username:', user.username);
    console.log('password match for', candidate, ':', match);
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
