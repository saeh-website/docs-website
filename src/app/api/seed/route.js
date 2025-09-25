// src/app/api/seed/route.js
import { seed } from "../../../../scripts/seed";
import { prismaPostgres } from "@/lib/prismaPostgres";
import { prismaMongo } from "@/lib/prismaMongo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔎 Seeding triggered via GET request...");

    // Debug: log Prisma models available at runtime
    console.log("🔎 Postgres models available:", Object.keys(prismaPostgres));
    console.log("🔎 Mongo models available:", Object.keys(prismaMongo));

    await seed();

    return NextResponse.json({
      message: "✅ Seeding completed (via GET)",
      postgresModels: Object.keys(prismaPostgres),
      mongoModels: Object.keys(prismaMongo),
    });
  } catch (err) {
    console.error("❌ Seeding error (GET):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log("🔎 Seeding triggered via POST request...");

    // Debug: log Prisma models available at runtime
    console.log("🔎 Postgres models available:", Object.keys(prismaPostgres));
    console.log("🔎 Mongo models available:", Object.keys(prismaMongo));

    await seed();

    return NextResponse.json({
      message: "✅ Seeding completed (via POST)",
      postgresModels: Object.keys(prismaPostgres),
      mongoModels: Object.keys(prismaMongo),
    });
  } catch (err) {
    console.error("❌ Seeding error (POST):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
