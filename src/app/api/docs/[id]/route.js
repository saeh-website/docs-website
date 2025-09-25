import { prismaMongo } from "@/lib/prismaMongo";
import { NextResponse } from "next/server";
import { withPermission } from "@/lib/permission_handler";

// Handler for updating a document
async function updateDocHandler(request, { params, session }) {
  const { id } = params;
  const { title, content, domainIds, visibleToRoles } = await request.json();

  if (!title || !content || !domainIds || !visibleToRoles) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const updatedDoc = await prismaMongo.doc.update({
    where: { id },
    data: { title, content, domainIds, visibleToRoles },
  });

  return NextResponse.json(updatedDoc);
}

// Handler for soft-deleting a document
async function softDeleteDocHandler(request, { params, session }) {
  const { id } = params;
  const updated = await prismaMongo.doc.update({
    where: { id },
    data: { deleted: true, deletedAt: new Date() },
  });
  return NextResponse.json(updated);
}

// Handler for restoring a soft-deleted document
async function restoreDocHandler(request, { params, session }) {
  const { id } = params;
  const updated = await prismaMongo.doc.update({
    where: { id },
    data: { deleted: false, deletedAt: null },
  });
  return NextResponse.json(updated);
}

// Handler for permanently deleting a document
async function permanentDeleteDocHandler(request, { params, session }) {
  const { id } = params;
  await prismaMongo.doc.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted permanently" });
}

// Main PUT handler that routes based on the 'action' body parameter
async function mainPutHandler(request, { params, session }) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'soft-delete':
        // Re-wrap the specific handler with its required permission
        return withPermission('doc_delete')(softDeleteDocHandler)(request, { params, session });
      case 'restore':
        // Assuming restore uses the same permission as update
        return withPermission('doc_update')(restoreDocHandler)(request, { params, session });
      case 'permanent-delete':
        // A more sensitive action, could have its own permission if needed
        return withPermission('doc_delete')(permanentDeleteDocHandler)(request, { params, session });
      default:
        // Default action is a regular update
        return withPermission('doc_update')(updateDocHandler)(request, { params, session });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message || "Error updating doc" }, { status: 500 });
  }
}

// Export the main handler for the PUT method.
// A base 'doc_update' permission is checked first. Specific actions inside might check for more permissions.
export const PUT = withPermission('doc_update')(mainPutHandler);
