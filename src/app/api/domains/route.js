import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prismaPostgres } from '@/lib/prismaPostgres';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Only doc_admin and superadmin can access domains
  if (!['doc_admin', 'superadmin'].includes(session.user.currentDomain.userRole)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const domains = await prismaPostgres.domain.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            userDomains: true,
            docs: true,
          },
        },
      },
    });

    return Response.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return new Response('Error fetching domains', { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!['doc_admin', 'superadmin'].includes(session.user.currentDomain.userRole)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const { name } = await request.json();

    if (!name) {
      return new Response('Domain name is required', { status: 400 });
    }

    const domain = await prismaPostgres.domain.create({
      data: { name },
    });

    return Response.json(domain);
  } catch (error) {
    if (error.code === 'P2002') {
      return new Response('Domain already exists', { status: 400 });
    }
    console.error('Error creating domain:', error);
    return new Response('Error creating domain', { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!['doc_admin', 'superadmin'].includes(session.user.currentDomain.userRole)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Domain ID is required', { status: 400 });
    }

    // Check if domain has users or docs
    const domainWithRelations = await prismaPostgres.domain.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userDomains: true,
            docs: true,
          },
        },
      },
    });

    if (domainWithRelations._count.userDomains > 0 || domainWithRelations._count.docs > 0) {
      return new Response('Cannot delete domain with existing users or documents', { status: 400 });
    }

    await prismaPostgres.domain.delete({
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return new Response('Error deleting domain', { status: 500 });
  }
}