import { prismaMongo } from "@/lib/prismaMongo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🌱 Testing MongoDB connection (Vercel)...");

    // Try fetching some data from your main collections
    const docs = await prismaMongo.doc.findMany({ take: 5 });
    const users = await prismaMongo.user.findMany({ take: 5 });

    return NextResponse.json({
      message: "MongoDB connection successful",
      docsCount: docs.length,
      usersCount: users.length,
      sampleDocs: docs,
      sampleUsers: users,
    });
  } catch (err) {
    console.error("❌ MongoDB connection error (Vercel):", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await prismaMongo.$disconnect();
  }
}
