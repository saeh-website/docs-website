import { seed } from "../../../../scripts/seed";
import { NextResponse } from "next/server";

// Allow GET to trigger seed for debugging in Chrome
export async function GET() {
  try {
    console.log("🔎 Seeding triggered via GET request...");
    await seed();
    return NextResponse.json({ message: "✅ Seeding completed (via GET)" });
  } catch (err) {
    console.error("❌ Seeding error (GET):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Keep POST for programmatic/manual triggering (e.g. curl or API client)
export async function POST() {
  try {
    console.log("🔎 Seeding triggered via POST request...");
    await seed();
    return NextResponse.json({ message: "✅ Seeding completed (via POST)" });
  } catch (err) {
    console.error("❌ Seeding error (POST):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
