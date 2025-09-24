import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prismaMongo } from "@/lib/prismaMongo";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.currentDomain?.userRole;
    if (!["site_admin", "doc_admin", "superadmin"].includes(role))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, content, domainId } = await request.json();
    if (!title || !content)
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });

    if (role === "site_admin") {
      const hasAccess = session.user.userDomains?.some(
        (ud) => ud.domainId === domainId && ud.userRole === "site_admin"
      );
      if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const doc = await prismaMongo.doc.create({
      data: {
        title,
        content,
        domainId: domainId || session.user.currentDomain.domainId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("POST /api/docs/add error:", err);
    return NextResponse.json({ error: err.message || "Error creating doc" }, { status: 500 });
  }
}
