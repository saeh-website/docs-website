import { prismaMongo } from "@/lib/prismaMongo";
import { NextResponse } from "next/server";
import { withPermission } from "@/lib/permission_handler";

export const dynamic = 'force-dynamic';

async function getDocsHandler(request, { session }) {
  try {
    const url = new URL(request.url);
    const domainId = url.searchParams.get("domainId");

    if (!domainId) {
      return NextResponse.json({ error: "domainId is required" }, { status: 400 });
    }

    const userRole = session.user.currentDomain.roleName;

    // Find documents that belong to the specified domain
    // and are visible to the user's role.
    const docs = await prismaMongo.doc.findMany({
      where: {
        domainIds: { has: domainId },
        visibleToRoles: { has: userRole },
        deleted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(docs);
  } catch (err) {
    console.error("GET /api/docs error:", err);
    return NextResponse.json(
      { error: err.message || "Error fetching docs" },
      { status: 500 }
    );
  }
}

export const GET = withPermission('doc_read')(getDocsHandler);
