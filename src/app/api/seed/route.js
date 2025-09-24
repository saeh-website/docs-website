import { seed } from "../../../../scripts/seed";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await seed();
    return NextResponse.json({ message: "✅ Seeding completed" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
