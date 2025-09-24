import { seed } from "../../../../scripts/seed";
import { NextResponse } from "next/server";

// Handle GET requests (browser)
export async function GET() {
  try {
    console.log("🌱 Seed triggered via GET");
    await seed();
    return NextResponse.json({ message: "✅ Seeding completed (via GET)" });
  } catch (err) {
    console.error("❌ Seeding error (GET):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Handle POST requests (curl or API clients)
export async function
