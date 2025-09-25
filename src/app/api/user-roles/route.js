import { NextResponse } from 'next/server';
import { prismaPostgres } from '@/lib/prismaPostgres';
import { withPermission } from '@/lib/permission_handler';

async function getUserRolesHandler(request, { session }) {
  try {
    const userRoles = await prismaPostgres.userRole.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            userDomains: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(userRoles);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching user roles' }, { status: 500 });
  }
}

async function createUserRoleHandler(request, { session }) {
  try {
    const { name, description, permissions } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    // Check if role already exists
    const existingRole = await prismaPostgres.userRole.findUnique({
      where: { name }
    });

    if (existingRole) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 });
    }

    // Create the role with permissions
    const userRole = await prismaPostgres.userRole.create({
      data: {
        name,
        description: description || null,
        rolePermissions: {
          create: permissions?.map(permission => ({
            permissionId: permission.permissionId,
            scopeAllDomains: permission.scopeAllDomains || false
          })) || []
        }
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return NextResponse.json(userRole);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating user role' }, { status: 500 });
  }
}

async function updateUserRoleHandler(request, { session }) {
  try {
    const { id, name, description, permissions } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    // Check if role exists
    const existingRole = await prismaPostgres.userRole.findUnique({
      where: { id }
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if new name conflicts with another role
    if (name && name !== existingRole.name) {
      const roleWithSameName = await prismaPostgres.userRole.findUnique({
        where: { name }
      });

      if (roleWithSameName) {
        return NextResponse.json({ error: 'Role name already exists' }, { status: 400 });
      }
    }

    // Update the role
    const updateData = {
      name: name || existingRole.name,
      description: description !== undefined ? description : existingRole.description
    };

    // If permissions are provided, update them
    if (permissions) {
      // Delete existing permissions
      await prismaPostgres.rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Add new permissions
      updateData.rolePermissions = {
        create: permissions.map(permission => ({
          permissionId: permission.permissionId,
          scopeAllDomains: permission.scopeAllDomains || false
        }))
      };
    }

    const updatedRole = await prismaPostgres.userRole.update({
      where: { id },
      data: updateData,
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating user role' }, { status: 500 });
  }
}

async function deleteUserRoleHandler(request, { session }) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    // Check if role exists
    const existingRole = await prismaPostgres.userRole.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userDomains: true
          }
        }
      }
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if role is being used by any users
    if (existingRole._count.userDomains > 0) {
      return NextResponse.json({ 
        error: `Cannot delete role. It is currently assigned to ${existingRole._count.userDomains} user(s).` 
      }, { status: 400 });
    }

    // Delete role permissions first
    await prismaPostgres.rolePermission.deleteMany({
      where: { roleId: id }
    });

    // Delete the role
    await prismaPostgres.userRole.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting user role' }, { status: 500 });
  }
}

// Apply permission middleware to each handler
export const GET = withPermission('userRole_read')(getUserRolesHandler);
export const POST = withPermission('userRole_create')(createUserRoleHandler);
export const PUT = withPermission('userRole_update')(updateUserRoleHandler);
export const DELETE = withPermission('userRole_delete')(deleteUserRoleHandler);
