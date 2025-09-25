import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prismaMongo } from "@/lib/prismaMongo";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.currentDomain?.userRole;
    if (!role) {
      return NextResponse.json({ error: "User role missing" }, { status: 400 });
    }

    const url = new URL(request.url);
    const domainId = url.searchParams.get("domainId");

    if (!domainId) {
      return NextResponse.json({ error: "domainId required" }, { status: 400 });
    }

    // Always filter by domainId (even for superadmin/doc_admin)
    const docs = await prismaMongo.doc.findMany({
      where: { domainId },
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
