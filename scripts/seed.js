const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // --- Create default domains ---
  const domainNames = ["option1", "option2", "option3"];
  const domains = await Promise.all(
    domainNames.map((name) =>
      prisma.domain.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  console.log("✅ Domains created:", domainNames);

  const hash = (pw) => bcrypt.hash(pw, 12);

  // --- Superadmin ---
  await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      password: await hash("admin123"),
      profilePicture: "/images/default-avatar.png",
      userDomains: { create: domains.map((domain, idx) => ({ domainId: domain.id, userRole: "superadmin", isDefault: idx === 0 })) },
    },
  });

  // --- Site Admin ---
  await prisma.user.upsert({
    where: { username: "siteadmin1" },
    update: {},
    create: {
      username: "siteadmin1",
      password: await hash("siteadmin123"),
      profilePicture: "/images/default-avatar.png",
      userDomains: { create: { domainId: domains[0].id, userRole: "site_admin", isDefault: true } },
    },
  });

  // --- Editor ---
  await prisma.user.upsert({
    where: { username: "editor1" },
    update: {},
    create: {
      username: "editor1",
      password: await hash("editor123"),
      profilePicture: "/images/default-avatar.png",
      userDomains: { create: { domainId: domains[0].id, userRole: "editor", isDefault: true } },
    },
  });

  // --- Sample document ---
  const option1DomainId = domains[0].id;
  const existingDoc = await prisma.doc.findFirst({ where: { title: "testdoc1", domainId: option1DomainId } });
  if (!existingDoc) {
    await prisma.doc.create({
      data: {
        title: "testdoc1",
        content: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel purus vitae eros ultricies aliquam.</p>
                  <img src="https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"
                       alt="placeholder" style="max-width:100%; height:auto;" />`,
        domainId: option1DomainId,
        authorId: "seed-user",
      },
    });
  }

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => { console.error("❌ Seeding error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
