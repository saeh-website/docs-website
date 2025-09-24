const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default domains
  const domainNames = ['option1', 'option2', 'option3'];
  const domains = await Promise.all(
    domainNames.map((name) =>
      prisma.domain.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  console.log('✅ Domains created:', domainNames);

  // Helper: hash password
  const hash = (pw) => bcrypt.hash(pw, 12);

  // Superadmin
  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password: await hash('admin123'),
      profilePicture: '/images/default-avatar.png',
      userDomains: {
        create: domains.map((domain, idx) => ({
          domainId: domain.id,
          userRole: 'superadmin',
          isDefault: idx === 0, // first domain is default
        })),
      },
    },
  });
  console.log('✅ Superadmin: superadmin / admin123');

  // Site Admin (option1 only)
  await prisma.user.upsert({
    where: { username: 'siteadmin1' },
    update: {},
    create: {
      username: 'siteadmin1',
      password: await hash('siteadmin123'),
      profilePicture: '/images/default-avatar.png',
      userDomains: {
        create: {
          domainId: domains[0].id,
          userRole: 'site_admin',
          isDefault: true,
        },
      },
    },
  });
  console.log('✅ Site Admin: siteadmin1 / siteadmin123');

  // Editor (option1 only)
  await prisma.user.upsert({
    where: { username: 'editor1' },
    update: {},
    create: {
      username: 'editor1',
      password: await hash('editor123'),
      profilePicture: '/images/default-avatar.png',
      userDomains: {
        create: {
          domainId: domains[0].id,
          userRole: 'editor',
          isDefault: true,
        },
      },
    },
  });
  console.log('✅ Editor: editor1 / editor123');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
