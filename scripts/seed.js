// scripts/seed.js
import { prismaPostgres } from "../src/lib/prismaPostgres";
import { prismaMongo } from "../src/lib/prismaMongo";
import bcrypt from "bcryptjs";

const postgres = prismaPostgres;
const mongo = prismaMongo;

const pgUser = postgres.User ?? postgres.user;
const pgDomain = postgres.Domain ?? postgres.domain;
const pgUserDomain = postgres.UserDomain ?? postgres.userDomain;
const pgUserRole = postgres.UserRole ?? postgres.userRole;
const pgPermission = postgres.Permission ?? postgres.permission;
const pgRolePermission = postgres.RolePermission ?? postgres.rolePermission;

const mgDoc = mongo.Doc ?? mongo.doc;

const hash = (pw) => bcrypt.hash(pw, 12);

const rolesHierarchy = ["editor", "site_admin", "doc_admin", "superadmin"];

export async function seed() {
  console.log("🌱 Starting database seed...");

  // --- Postgres: create user roles ---
  const rolesData = [
    { name: "editor", description: "Can edit documents." },
    { name: "site_admin", description: "Can manage site settings." },
    { name: "doc_admin", description: "Can manage documents." },
    { name: "superadmin", description: "Has all permissions." },
  ];

  const roles = await Promise.all(
    rolesData.map((role) =>
      pgUserRole.upsert({
        where: { name: role.name },
        update: {},
        create: role,
      })
    )
  );
  const rolesMap = roles.reduce((acc, role) => {
    acc[role.name] = role;
    return acc;
  }, {});
  console.log("✅ User roles created/verified:", roles.map(r => r.name));


  // --- Postgres: create permissions ---
  const permissionsData = [
    // Docs
    { name: 'doc_create', description: 'Can create documents' },
    { name: 'doc_read', description: 'Can read documents' },
    { name: 'doc_update', description: 'Can update documents' },
    { name: 'doc_delete', description: 'Can delete documents' },
    // Users
    { name: 'user_create', description: 'Can create users' },
    { name: 'user_read', description: 'Can read users' },
    { name: 'user_update', description: 'Can update users' },
    { name: 'user_delete', description: 'Can delete users' },
    // UserRoles
    { name: 'userRole_create', description: 'Can create user roles' },
    { name: 'userRole_read', description: 'Can read user roles' },
    { name: 'userRole_update', description: 'Can update user roles' },
    { name: 'userRole_delete', description: 'Can delete user roles' },
    // Domains
    { name: 'domain_create', description: 'Can create domains' },
    { name: 'domain_read', description: 'Can read domains' },
    { name: 'domain_update', description: 'Can update domains' },
    { name: 'domain_delete', description: 'Can delete domains' },
  ];

  const permissions = await Promise.all(
    permissionsData.map((p) =>
      pgPermission.upsert({
        where: { name: p.name },
        update: {},
        create: p,
      })
    )
  );
  const permissionsMap = permissions.reduce((acc, p) => {
    acc[p.name] = p;
    return acc;
  }, {});
  console.log('✅ Permissions created/verified:', permissions.map(p => p.name));

  // --- Postgres: grant permissions to roles ---
  const rolePermissionsData = {
    superadmin: permissions.map((p) => p.id), // All permissions
    doc_admin: [
      permissionsMap['doc_create'].id,
      permissionsMap['doc_read'].id,
      permissionsMap['doc_update'].id,
      permissionsMap['doc_delete'].id,
    ],
    site_admin: [
      permissionsMap['user_create'].id,
      permissionsMap['user_read'].id,
      permissionsMap['user_update'].id,
      permissionsMap['user_delete'].id,
      permissionsMap['domain_create'].id,
      permissionsMap['domain_read'].id,
      permissionsMap['domain_update'].id,
      permissionsMap['domain_delete'].id,
    ],
    editor: [
      permissionsMap['doc_read'].id,
      permissionsMap['doc_update'].id,
    ],
  };

  for (const roleName in rolePermissionsData) {
    const roleId = rolesMap[roleName].id;
    const permissionIds = rolePermissionsData[roleName];

    for (const permissionId of permissionIds) {
      await pgRolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }
  console.log('✅ Role permissions granted');

  // --- Postgres: create domains ---
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

  // --- Postgres: create users ---
  const usersData = [
    { username: "superadmin", password: "admin123", role: "superadmin" },
    { username: "docadmin1", password: "docadmin123", role: "doc_admin" },
    { username: "siteadmin1", password: "siteadmin123", role: "site_admin" },
    { username: "editor1", password: "editor123", role: "editor" },
    { username: "editor2", password: "editor123", role: "editor" },
  ];

  for (const u of usersData) {
    const user = await pgUser.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username: u.username,
        password: await hash(u.password),
        profilePicture: "/images/default-avatar.png",
      },
    });

    // Assign userDomains
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      let userRole = u.role;

      // For editor, only assign to first domain randomly
      if (u.role === "editor") {
        if (i > 0) continue;
      }

      await pgUserDomain.upsert({
        where: {
          userId_domainId: { userId: user.id, domainId: domain.id },
        },
        update: {},
        create: {
          userId: user.id,
          domainId: domain.id,
          userRoleId: rolesMap[userRole].id, // role bound to domain
        },
      });
    }
  }
  console.log("✅ Users and userDomains created");

  // --- MongoDB: sample documents ---
  const sampleDocs = [
    {
      title: "Welcome Guide",
      content: "<p>Welcome to the platform! This doc is for all users.</p>",
      domainIds: domains.map((d) => d.id),
      visibleToRoles: rolesHierarchy, // all roles
    },
    {
      title: "Editor Guidelines",
      content: "<p>This document is only for editors.</p>",
      domainIds: [domains[0].id],
      visibleToRoles: ["editor"],
    },
    {
      title: "Admin Instructions",
      content: "<p>Instructions for site and doc admins only.</p>",
      domainIds: domains.map((d) => d.id),
      visibleToRoles: ["site_admin", "doc_admin", "superadmin"],
    },
    {
      title: "Superadmin Secret",
      content: "<p>Only superadmin can see this doc.</p>",
      domainIds: domains.map((d) => d.id),
      visibleToRoles: ["superadmin"],
    },
  ];

  for (const doc of sampleDocs) {
    const existing = await mgDoc.findFirst({ where: { title: doc.title } });
    if (!existing) {
      await mgDoc.create({
        data: {
          ...doc,
          authorId: "0", // optional, you can assign a userId from postgres
        },
      });
      console.log(`✅ Created doc: ${doc.title}`);
    } else {
      console.log(`ℹ️ Doc already exists: ${doc.title}`);
    }
  }

  console.log("🎉 Database seeding completed!");

  // Disconnect
  await postgres.$disconnect();
  await mongo.$disconnect();
}
