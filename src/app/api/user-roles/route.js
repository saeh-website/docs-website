import { NextResponse } from "next/server";
import { prismaPostgres } from "@/lib/prismaPostgres";
import { withPermission } from "@/lib/permission_handler";

/**
 * Format role consistently for frontend
 * Always guarantees: { id: string, name: string, description, permissions[], assignedUsersCount }
 */
function formatRole(role) {
  return {
    id: String(role.id), // normalize to string
    name: role.name,
    description: role.description || "",
    permissions: (role.rolePermissions || []).map((rp) => ({
      id: String(rp.permission.id),
      name: rp.permission.name,
      scopeAllDomains: rp.scopeAllDomains,
    })),
    assignedUsersCount: role._count?.userDomains || 0,
  };
}

/**
 * GET /api/user-roles
 */
async function getUserRolesHandler() {
  try {
    const roles = await prismaPostgres.userRole.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userDomains: true } },
      },
      orderBy: { name: "asc" },
    });

    // Guarantee { id, name } at minimum
    return NextResponse.json(roles.map(formatRole));
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json({ error: "Error fetching user roles" }, { status: 500 });
  }
}

/**
 * POST /api/user-roles
 */
async function createUserRoleHandler(request) {
  try {
    const { name, description, permissions } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    // Prevent duplicate role name
    const existing = await prismaPostgres.userRole.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Role name already exists" }, { status: 400 });
    }

    const created = await prismaPostgres.userRole.create({
      data: {
        name,
        description: description || null,
        rolePermissions: {
          create: (permissions || []).map((p) => ({
            permissionId: p.permissionId,
            scopeAllDomains: p.scopeAllDomains || false,
          })),
        },
      },
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userDomains: true } },
      },
    });

    return NextResponse.json(formatRole(created));
  } catch (error) {
    console.error("Error creating user role:", error);
    return NextResponse.json({ error: "Error creating user role" }, { status: 500 });
  }
}

/**
 * PUT /api/user-roles
 */
async function updateUserRoleHandler(request) {
  try {
    const { id, name, description, permissions } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    const existing = await prismaPostgres.userRole.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Prevent name conflict
    if (name && name !== existing.name) {
      const conflict = await prismaPostgres.userRole.findUnique({ where: { name } });
      if (conflict) {
        return NextResponse.json({ error: "Another role with this name already exists" }, { status: 400 });
      }
    }

    const updateData = {
      name: name || existing.name,
      description: description !== undefined ? description : existing.description,
    };

    if (Array.isArray(permissions)) {
      await prismaPostgres.rolePermission.deleteMany({ where: { roleId: id } });
      updateData.rolePermissions = {
        create: permissions.map((p) => ({
          permissionId: p.permissionId,
          scopeAllDomains: p.scopeAllDomains || false,
        })),
      };
    }

    const updated = await prismaPostgres.userRole.update({
      where: { id },
      data: updateData,
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userDomains: true } },
      },
    });

    return NextResponse.json(formatRole(updated));
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Error updating user role" }, { status: 500 });
  }
}

/**
 * DELETE /api/user-roles
 */
async function deleteUserRoleHandler(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    const existing = await prismaPostgres.userRole.findUnique({
      where: { id },
      include: { _count: { select: { userDomains: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (existing._count.userDomains > 0) {
      return NextResponse.json(
        { error: `Cannot delete role. It is currently assigned to ${existing._count.userDomains} user(s).` },
        { status: 400 }
      );
    }

    await prismaPostgres.rolePermission.deleteMany({ where: { roleId: id } });
    await prismaPostgres.userRole.delete({ where: { id } });

    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting user role:", error);
    return NextResponse.json({ error: "Error deleting user role" }, { status: 500 });
  }
}

// Export with permission checks
export const GET = withPermission("userRole_read")(getUserRolesHandler);
export const POST = withPermission("userRole_create")(createUserRoleHandler);
export const PUT = withPermission("userRole_update")(updateUserRoleHandler);
export const DELETE = withPermission("userRole_delete")(deleteUserRoleHandler);
