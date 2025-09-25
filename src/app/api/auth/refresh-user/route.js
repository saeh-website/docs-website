import { NextResponse } from 'next/server';
import { prismaPostgres } from '@/lib/prismaPostgres';
import { withAuth } from '@/lib/permission_handler';

async function refreshUserHandler(request, { session }) {
  try {
    const userId = session.user.id;

    // Fetch fresh user data from database with current domain
    const user = await prismaPostgres.user.findUnique({
      where: { id: userId },
      include: {
        userDomains: {
          include: {
            domain: true,
            userRole: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        currentDomain: {
          include: {
            domain: true,
            userRole: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Process the user data in the same way as the JWT callback
    const userDomains = user.userDomains.map((ud) => ({
      id: ud.id,
      domain: ud.domain,
      roleName: ud.userRole.name,
    }));

    // Determine current domain and extract its permissions
    const currentDomain = user.currentDomain || user.userDomains[0] || null;
    
    let processedCurrentDomain = null;
    if (currentDomain) {
      const permissions = currentDomain.userRole.rolePermissions.map(
        (rp) => ({
          name: rp.permission.name,
          scopeAllDomains: rp.scopeAllDomains,
        })
      );
      processedCurrentDomain = {
        id: currentDomain.id,
        domain: currentDomain.domain,
        roleName: currentDomain.userRole.name,
        permissions: permissions,
      };
    } else {
      processedCurrentDomain = user.userDomains[0];
    }

    const refreshedUserData = {
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
      userDomains: userDomains,
      currentDomain: processedCurrentDomain,
      requiresDomainSelection: !processedCurrentDomain,
    };

    console.log("Returning refreshed user data:", refreshedUserData);
    return NextResponse.json(refreshedUserData);
  } catch (error) {
    console.error('Error refreshing user data:', error);
    return NextResponse.json({ error: 'Failed to refresh user data' }, { status: 500 });
  }
}

export const GET = withAuth(refreshUserHandler);
