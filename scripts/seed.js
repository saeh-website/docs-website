import { prismaPostgres } from "../src/lib/prismaPostgres";
import { prismaMongo } from "../src/lib/prismaMongo";
import bcrypt from "bcryptjs";

const postgres = prismaPostgres;
const mongo = prismaMongo;

// Normalize Postgres models (handle User vs user casing differences)
const pgUser = postgres.User ?? postgres.user;
const pgDomain = postgres.Domain ?? postgres.domain;

// Normalize Mongo models
const mgDoc = mongo.Doc ?? mongo.doc;

export async function seed() {
  console.log("🌱 Starting database seed...");

  // --- Create default domains in Postgres ---
  const domainNames = ["option1", "option2", "option3"];
  const domains = await Promise.all(
    domainNames.map((name) =>
      pgDomain.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  console.log("✅ Domains created:", domainNames);

  const hash = (pw) => bcrypt.hash(pw, 12);

  // --- Superadmin ---
  const superadmin = await pgUser.upsert({
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
  await pgUser.upsert({
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

  await pgUser.upsert({
    where: { username: "siteadmin3" },
    update: {},
    create: {
      username: "siteadmin2",
      password: await hash("siteadmin123"),
      profilePicture: "/images/default-avatar.png",
      userDomains: {
        create: {
          domainId: domains[2].id,
          userRole: "site_admin",
          isDefault: true,
        },
      },
    },
  });

  // --- Editor ---
  await pgUser.upsert({
    where: { username: "editor2" },
    update: {},
    create: {
      username: "editor1",
      password: await hash("editor123"),
      profilePicture: "/images/default-avatar.png",
      userDomains: {
        create: {
          domainId: domains[1].id,
          userRole: "editor",
          isDefault: true,
        },
        create: {
          domainId: domains[0].id,
          userRole: "site_admin",
          isDefault: false,
        },
      },
    },
  });

  // --- Sample documents in Mongo for all domains ---
  for (const domain of domains) {
    const existingDoc = await mgDoc.findFirst({
      where: {
        title: `testdoc2-${domain.name}`,
        domainId: String(domain.id),
      },
    });

    if (!existingDoc) {
      await mgDoc.create({
        data: {
          title: `testdoc-${domain.name}`,
          content: `
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. هذه مستند تجريبي لنطاق ${domain.name}.</p>
            <img src="https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg"
                 alt="placeholder" style="max-width:100%; height:auto;" />
          `,
          domainId: String(domain.id),
          authorId: String(superadmin.id),
        },
      });
      console.log(`✅ Sample document "testdoc2-${domain.name}" created for domain ${domain.name}`);
    } else {
      console.log(`ℹ️ Sample document "testdoc2-${domain.name}" already exists for domain ${domain.name}`);
    }
  }

  console.log("🎉 Database seeding completed!");

  // disconnect clients
  await postgres.$disconnect();
  await mongo.$disconnect();
}
