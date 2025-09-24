import { NextResponse } from "next/server";
import { prismaMongo } from "@/lib/prismaMongo";

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, domainId, content, authorId } = body;

    // ✅ Validate required fields
    if (!title || !domainId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Save document into MongoDB via Prisma
    const newDoc = await prismaMongo.docs.create({
      data: {
        title,
        domainId,
        content,
        authorId: authorId || null,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, doc: newDoc }, { status: 201 });
  } catch (error) {
    console.error("❌ Error adding doc:", error);
    return NextResponse.json(
      { error: "Failed to add doc" },
      { status: 500 }
    );
  }
}
