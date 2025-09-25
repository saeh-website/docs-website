import { NextResponse } from 'next/server';
import { prismaPostgres } from '@/lib/prismaPostgres';
import { withPermission } from '@/lib/permission_handler';

async function getPermissionsHandler(request, { session }) {
  try {
    const permissions = await prismaPostgres.permission.findMany({
      include: {
        _count: {
          select: {
            rolePermissions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(permissions);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching permissions' }, { status: 500 });
  }
}

// Only allow users with userRole_read permission to view permissions
// (since permissions are primarily used for role management)
export const GET = withPermission('userRole_read')(getPermissionsHandler);
