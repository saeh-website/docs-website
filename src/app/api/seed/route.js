import { NextResponse } from "next/server";
import { seed } from "../../../../scripts/seed";

export async function POST() {
  try {
    await seed();
    return NextResponse.json({ message: "✅ Seeding completed" });
  } catch (err) {
    console.error("❌ Seeding error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
