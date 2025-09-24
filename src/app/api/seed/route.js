// src/app/api/seed/route.js
import { seed } from "../../../../scripts/seed";
import { NextResponse } from "next/server";

// Allow POST trigger (via curl) and GET trigger (via browser)
export async function POST() {
  try {
    await seed();
    return NextResponse.json({ message: "✅ Seeding completed" });
  } catch (err) {
    console.error("❌ Seeding error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return POST(); // reuse the POST handler
}
