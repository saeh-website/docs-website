const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prismaPostgres = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default domains
  const domains = await Promise.all([
    prismaPostgres.domain.upsert({
      where: { name: 'option1' },
      update: {},
      create: { name: 'option1' },
    }),
    prismaPostgres.domain.upsert({
      where: { name: 'option2' },
      update: {},
      create: { name: 'option2' },
    }),
    prismaPostgres.domain.upsert({
      where: { name: 'option3' },
      update: {},
      create: { name: 'option3' },
    }),
  ]);

  console.log('✅ Domains created:', domains.map(d => d.name));

  // Create superadmin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const superadmin = await prismaPostgres.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password: hashedPassword,
      profilePicture: '/images/default-avatar.png',
      userDomains: {
        create: domains.map(domain => ({
          domainId: domain.id,
          userRole: 'superadmin',
        })),
      },
    },
    include: {
      userDomains: {
        include: {
          domain: true,
        },
      },
    },
  });

  console.log('✅ Superadmin user created: superadmin / admin123');

  // Create sample site_admin user for option1
  const siteAdminPassword = await bcrypt.hash('siteadmin123', 12);
  const siteAdmin = await prismaPostgres.user.upsert({
    where: { username: 'siteadmin1' },
    update: {},
    create: {
      username: 'siteadmin1',
      password: siteAdminPassword,
      profilePicture: '/images/default-avatar.png',
      userDomains: {
        create: {
          domainId: domains[0].id, // option1
          userRole: 'site_admin',
        },
      },
    },
  });

  console.log('✅ Site Admin user created: siteadmin1 / siteadmin123');

  // Create sample editor user
  const editorPassword = await bcrypt.hash('editor123', 12);
  const editor = await prismaPostgres.user.upsert({
    where: { username: 'editor1' },
    update: {},
    create: {
      username: 'editor1',
      password: editorPassword,
      profilePicture: '/images/default-avatar.png',
      userDomains: {
        create: {
          domainId: domains[0].id, // option1
          userRole: 'editor',
        },
      },
    },
  });

  console.log('✅ Editor user created: editor1 / editor123');

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Default login credentials:');
  console.log('Superadmin: superadmin / admin123 (all domains)');
  console.log('Site Admin: siteadmin1 / siteadmin123 (option1 only)');
  console.log('Editor: editor1 / editor123 (option1 only)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaPostgres.$disconnect();
  });