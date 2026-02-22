import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

// Load env vars
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@neximprove.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await prisma.user.create({
      data: {
        fullName: 'System Admin',
        email: 'admin@neximprove.com',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log('Admin user seeded: admin@neximprove.com / Admin@123');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
