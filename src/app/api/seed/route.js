import seed from "@/scripts/seed"; // adjust if path is different
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await seed();
    return NextResponse.json({ message: "✅ Seeding completed" });
  } catch (err) {
    console.error("❌ Seeding error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
