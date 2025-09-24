import { seed } from "../../../../scripts/seed";
import { prismaPostgres } from "@/lib/prismaPostgres";
import { prismaMongo } from "@/lib/prismaMongo";
import { NextResponse } from "next/server";

async function runSeed(method) {
  try {
    console.log(`🔎 Seeding triggered via ${method} request...`);

    const pgModels = Object.keys(prismaPostgres);
    const mgModels = Object.keys(prismaMongo);

    console.log("🔎 Postgres models available:", pgModels);
    console.log("🔎 Mongo models available:", mgModels);

    await seed();

    return NextResponse.json({
      message: `✅ Seeding completed (via ${method})`,
      postgresModels: pgModels,
      mongoModels: mgModels,
    });
  } catch (err) {
    const pgModels = Object.keys(prismaPostgres);
    const mgModels = Object.keys(prismaMongo);

    console.error(`❌ Seeding error (${method}):`, err);

    return NextResponse.json(
      {
        error: err.message,
        postgresModels: pgModels,
        mongoModels: mgModels,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return runSeed("GET");
}

export async function POST() {
  return runSeed("POST");
}
