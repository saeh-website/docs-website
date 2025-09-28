import { prismaMongo } from "@/lib/prismaMongo";
import { NextResponse } from "next/server";
import { withPermission } from "@/lib/permission_handler";

// Update
async function updateDocHandler(request, { params }) {
  const { id } = params;
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

  const updatedDoc = await prismaMongo.doc.update({
    where: { id },
    data: { title, content, domainIds, visibleToRoles },
  });

  return NextResponse.json(updatedDoc);
}

// Soft delete
async function softDeleteDocHandler(_, { params }) {
  const { id } = params;
  const updated = await prismaMongo.doc.update({
    where: { id },
    data: { deleted: true, deletedAt: new Date() },
  });
  return NextResponse.json(updated);
}

// Restore
async function restoreDocHandler(_, { params }) {
  const { id } = params;
  const updated = await prismaMongo.doc.update({
    where: { id },
    data: { deleted: false, deletedAt: null },
  });
  return NextResponse.json(updated);
}

// Permanent delete
async function permanentDeleteDocHandler(_, { params }) {
  const { id } = params;
  await prismaMongo.doc.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted permanently" });
}

// Main PUT
async function mainPutHandler(request, { params, session }) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "soft-delete":
        return withPermission("doc_delete")(softDeleteDocHandler)(request, {
          params,
          session,
        });
      case "restore":
        return withPermission("doc_update")(restoreDocHandler)(request, {
          params,
          session,
        });
      case "permanent-delete":
        return withPermission("doc_delete")(permanentDeleteDocHandler)(request, {
          params,
          session,
        });
      default:
        return withPermission("doc_update")(updateDocHandler)(request, {
          params,
          session,
        });
    }
  } catch (err) {
    console.error("PUT /api/docs/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Error updating doc" },
      { status: 500 }
    );
  }
}

export const PUT = withPermission("doc_update")(mainPutHandler);
