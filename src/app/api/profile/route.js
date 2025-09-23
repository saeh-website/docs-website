import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prismaPostgres } from '@/lib/prismaPostgres';

export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { username, profilePicture } = await request.json();

    if (!username) {
      return new Response('Username is required', { status: 400 });
    }

    // Check if username is already taken by another user
    const existingUser = await prismaPostgres.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return new Response('Username already exists', { status: 400 });
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

    return Response.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return new Response('Error updating profile', { status: 500 });
  }
}
