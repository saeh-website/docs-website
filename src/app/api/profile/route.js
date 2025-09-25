import { prismaPostgres } from '../../../lib/prismaPostgres';
import { withAuth } from '../../../lib/permission_handler';
import { NextResponse } from 'next/server';

async function updateProfileHandler(request, { session }) {
  try {
    const { username, profilePicture } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Check if username is already taken by another user
    const existingUser = await prismaPostgres.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const updatedUser = await prismaPostgres.user.update({
      where: { id: session.user.id },
      data: {
        username,
        profilePicture: profilePicture || session.user.profilePicture,
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
  }
}

export const PUT = withAuth(updateProfileHandler);
