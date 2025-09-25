import { prismaMongo } from "@/lib/prismaMongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.currentDomain?.userRole?.toLowerCase();
    if (!["superadmin", "doc_admin", "site_admin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, title, content, domainId } = body;

    if (action === "soft-delete") {
      const updated = await prismaMongo.doc.update({
        where: { id },
        data: { deleted: true, deletedAt: new Date() },
      });
      return NextResponse.json(updated);
    }

    if (action === "republish") {
      const updated = await prismaMongo.doc.update({
        where: { id },
        data: { deleted: false, deletedAt: null },
      });
      return NextResponse.json(updated);
    }

    if (action === "permanent-delete") {
      if (!["superadmin", "doc_admin"].includes(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await prismaMongo.doc.delete({ where: { id } });
      return NextResponse.json({ message: "Deleted permanently" });
    }

    // Regular edit
    if (!title || !content || !domainId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedDoc = await prismaMongo.doc.update({
      where: { id },
      data: { title, content, domainId },
    });

    return NextResponse.json(updatedDoc);
  } catch (err) {
    console.error("PUT /api/docs/[id] error:", err);
    return NextResponse.json({ error: err.message || "Error updating doc" }, { status: 500 });
  }
}
