import { prismaMongo } from "@/lib/prismaMongo";
import { NextResponse } from "next/server";
import { withPermission } from "@/lib/permission_handler";

async function createDocHandler(request, { session }) {
  try {
    const { title, content, domainIds, visibleToRoles } = await request.json();

    if (
      !title ||
      !content ||
      !Array.isArray(domainIds) ||
      domainIds.length === 0 ||
      !Array.isArray(visibleToRoles)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    const doc = await prismaMongo.doc.create({
      data: {
        title,
        content,
        domainIds,
        visibleToRoles,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("POST /api/docs/add error:", err);
    return NextResponse.json(
      { error: err.message || "Error creating doc" },
      { status: 500 }
    );
  }
}

export const POST = withPermission("doc_create")(createDocHandler);
