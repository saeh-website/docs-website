import { NextResponse } from "next/server";
import { prismaPostgres } from "@/lib/prismaPostgres";
import { prismaMongo } from "@/lib/prismaMongo";

export async function GET() {
  try {
    // --- Test Postgres ---
    let pgUsers = [];
    let pgDomains = [];

    try {
      pgUsers = await prismaPostgres.user.findMany({
        take: 5, // just sample first 3
      });
      pgDomains = await prismaPostgres.domain.findMany({
        take: 5,
      });
    } catch (err) {
      console.error("❌ Postgres test error:", err);
    }

    // --- Test Mongo ---
    let mongoDocs = [];
    try {
      mongoDocs = await prismaMongo.doc.findMany({
        take: 3,
      });
    } catch (err) {
      console.error("❌ Mongo test error:", err);
    }

    return NextResponse.json({
      message: "✅ Test completed",
      postgres: {
        users: pgUsers,
        domains: pgDomains,
      },
      mongo: {
        docs: mongoDocs,
      },
    });
  } catch (err) {
    console.error("❌ General test API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
