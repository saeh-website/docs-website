import { prismaPostgres } from "@/lib/prismaPostgres";
import { prismaMongo } from "@/lib/prismaMongo";
import bcrypt from "bcryptjs";

const postgres = prismaPostgres;
const mongo = prismaMongo;

async function main() {
  console.log("🌱 Starting database seed...");

  // --- Create default domains in Postgres ---
  const domainNames = ["option1", "option2", "option3"];
  const domains = await Promise.all(
    domainNames.map((name) =>
      postgres.domain.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  console.log("✅ Domains created:", domainNames);

  const hash = (pw) => bcrypt.hash(pw, 12);

  // --- Superadmin ---
  const superadmin = await postgres.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      password: await hash("admin123"),
      profilePicture: "/images/default-avatar.png",
      userDomains: {
        create: domains.map((domain, idx) => ({
          domainId: domain.id,
          userRole: "superadmin",
          isDefault: idx === 0,
        })),
      },
    },
  });

  // --- Site Admin ---
  await postgres.user.upsert({
    where: { username: "siteadmin1" },
    update: {},
    create: {
      username: "siteadmin1",
      password: await hash("siteadmin123"),
      profilePicture: "/images/default-avatar.png",
      userDomains: {
        create: {
          domainId: domains[0].id,
          userRole: "site_admin",
          isDefault: true,
        },
      },
    },
  });

  // --- Editor ---
  await postgres.user.upsert({
    where: { username: "editor1" },
    update: {},
    create: {
      username: "editor1",
      password: await hash("editor123"),
      profilePicture: "/images/default-avatar.png",
      userDomains: {
        create: {
          domainId: domains[0].id,
          userRole: "editor",
          isDefault: true,
        },
      },
    },
  });

  // --- Sample documents in Mongo for all domains ---
  for (const domain of domains) {
    const existingDoc = await mongo.doc.findFirst({
      where: { title: `testdoc-${domain.name}`, domainId: domain.id },
    });

    if (!existingDoc) {
      await mongo.doc.create({
        data: {
          title: `testdoc-${domain.name}`,
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. هذه مستند تجريبي لنطاق ${domain.name}.</p>
            <img src="https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"
                 alt="placeholder" style="max-width:100%; height:auto;" />
          `,
          domainId: domain.id,
          authorId: superadmin.id,
        },
      });
      console.log(`✅ Sample document "testdoc-${domain.name}" created for domain ${domain.name}`);
    } else {
      console.log(`ℹ️ Sample document "testdoc-${domain.name}" already exists for domain ${domain.name}`);
    }
  }

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await postgres.$disconnect();
    await mongo.$disconnect();
  });
