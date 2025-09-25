// src/app/api/seed/route.js
import { seed } from "../../../../scripts/seed";
import { prismaPostgres } from "@/lib/prismaPostgres";
import { prismaMongo } from "@/lib/prismaMongo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await seed();

    return NextResponse.json({
      message: "✅ Seeding completed (via GET)",
      postgresModels: Object.keys(prismaPostgres),
      mongoModels: Object.keys(prismaMongo),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await seed();

    return NextResponse.json({
      message: "✅ Seeding completed (via POST)",
      postgresModels: Object.keys(prismaPostgres),
      mongoModels: Object.keys(prismaMongo),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
