import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prismaPostgres } from '@/lib/prismaPostgres';
import bcrypt from 'bcryptjs';
import { withPermission } from '@/lib/permission_handler';
import { NextResponse } from 'next/server';

async function getUsersHandler(request, { session }) {
  try {
    const readPermission = session.user.currentDomain.permissions.find(p => p.name === 'user_read');
    const canReadAllUsers = readPermission?.scopeAllDomains;

    let users;

    if (canReadAllUsers) {
      // If user has global 'user_read', fetch all users
      users = await prismaPostgres.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { userDomains: { include: { domain: true, userRole: true } } },
      });
    } else {
      // Otherwise, fetch only users within the domains this user is part of
      const userDomainIds = session.user.userDomains.map(ud => ud.domain.id);
      users = await prismaPostgres.user.findMany({
        where: {
          userDomains: {
            some: {
              domainId: { in: userDomainIds },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        include: { userDomains: { include: { domain: true, userRole: true } } },
      });
    }

    // Remove password from all users before sending
    const usersWithoutPasswords = users.map(u => {
      const { password, ...user } = u;
      return user;
    });

    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}

export const GET = withPermission('user_read')(getUsersHandler);

async function createUserHandler(request, { session }) {
  try {
    const { username, password, profilePicture, domains } = await request.json();

    if (!username || !password || !domains || domains.length === 0) {
      return NextResponse.json({ error: 'Username, password, and at least one domain are required' }, { status: 400 });
    }

    const existingUser = await prismaPostgres.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Permission check: can the current user assign users to these domains?
    const createPermission = session.user.currentDomain.permissions.find(p => p.name === 'user_create');
    if (!createPermission.scopeAllDomains) {
      const adminDomainIds = new Set(session.user.userDomains.map(ud => ud.domain.id));
      const targetDomainIds = domains.map(d => d.domainId);
      if (!targetDomainIds.every(id => adminDomainIds.has(id))) {
        return NextResponse.json({ error: 'You can only assign users to domains you are a part of.' }, { status: 403 });
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
            userRoleId: domain.userRoleId, // Assuming client sends userRoleId
          })),
        },
      },
      include: {
        userDomains: {
          include: {
            domain: true,
            userRole: true
          },
        },
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}

export const POST = withPermission('user_create')(createUserHandler);

async function deleteUserHandler(request, { session }) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const userToDelete = await prismaPostgres.user.findUnique({
      where: { id },
      include: { userDomains: true },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Permission check: can the current user delete this user?
    const deletePermission = session.user.currentDomain.permissions.find(p => p.name === 'user_delete');
    if (!deletePermission.scopeAllDomains) {
      const adminDomainIds = new Set(session.user.userDomains.map(ud => ud.domain.id));
      const targetUserDomainIds = userToDelete.userDomains.map(ud => ud.domainId);
      if (!targetUserDomainIds.some(id => adminDomainIds.has(id))) {
        return NextResponse.json({ error: 'You can only delete users within your domains.' }, { status: 403 });
      }
    }

    await prismaPostgres.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
}

export const DELETE = withPermission('user_delete')(deleteUserHandler);
