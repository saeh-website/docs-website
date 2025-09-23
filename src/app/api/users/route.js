import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prismaPostgres } from '@/lib/prismaPostgres';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Only site_admin, doc_admin, and superadmin can access users
  const allowedRoles = ['site_admin', 'doc_admin', 'superadmin'];
  if (!allowedRoles.includes(session.user.currentDomain.userRole)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    let users;

    if (session.user.currentDomain.userRole === 'superadmin') {
      // Superadmin can see all users
      users = await prismaPostgres.user.findMany({
        include: {
          userDomains: {
            include: {
              domain: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (session.user.currentDomain.userRole === 'doc_admin') {
      // Doc admin can see all users but only manage within their permissions
      users = await prismaPostgres.user.findMany({
        include: {
          userDomains: {
            include: {
              domain: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (session.user.currentDomain.userRole === 'site_admin') {
      // Site admin can only see users in their domains
      const userDomainIds = session.user.userDomains
        .filter(ud => ud.userRole === 'site_admin')
        .map(ud => ud.domainId);

      users = await prismaPostgres.user.findMany({
        where: {
          userDomains: {
            some: {
              domainId: { in: userDomainIds },
            },
          },
        },
        include: {
          userDomains: {
            include: {
              domain: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return Response.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response('Error fetching users', { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const allowedRoles = ['site_admin', 'doc_admin', 'superadmin'];
  if (!allowedRoles.includes(session.user.currentDomain.userRole)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const { username, password, profilePicture, domains } = await request.json();

    if (!username || !password || !domains || domains.length === 0) {
      return new Response('Username, password, and at least one domain are required', { status: 400 });
    }

    // Check if username already exists
    const existingUser = await prismaPostgres.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return new Response('Username already exists', { status: 400 });
    }

    // Validate domain access based on user role
    for (const domain of domains) {
      if (session.user.currentDomain.userRole === 'site_admin') {
        // Site admin can only add users to domains where they are site_admin
        const hasAccess = session.user.userDomains.some(
          ud => ud.domainId === domain.domainId && ud.userRole === 'site_admin'
        );
        if (!hasAccess) {
          return new Response(`Forbidden: No access to domain ${domain.domainId}`, { status: 403 });
        }
      }

      // Check role hierarchy
      const currentUserRole = session.user.currentDomain.userRole;
      const targetRole = domain.userRole;

      const roleHierarchy = ['editor', 'site_admin', 'doc_admin', 'superadmin'];
      const currentUserIndex = roleHierarchy.indexOf(currentUserRole);
      const targetRoleIndex = roleHierarchy.indexOf(targetRole);

      if (targetRoleIndex >= currentUserIndex) {
        return new Response(`Cannot assign role ${targetRole} - insufficient permissions`, { status: 403 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prismaPostgres.user.create({
      data: {
        username,
        password: hashedPassword,
        profilePicture: profilePicture || '/images/default-avatar.png',
        userDomains: {
          create: domains.map(domain => ({
            domainId: domain.domainId,
            userRole: domain.userRole,
          })),
        },
      },
      include: {
        userDomains: {
          include: {
            domain: true,
          },
        },
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return Response.json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response('Error creating user', { status: 500 });
  }
}