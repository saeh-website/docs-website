import { prismaPostgres } from '@/lib/prismaPostgres';
import { withPermission } from '@/lib/permission_handler';
import { NextResponse } from 'next/server';

async function getDomainsHandler(request, { session }) {
  try {
    const domains = await prismaPostgres.domain.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            userDomains: true,
          },
        },
      },
    });

    return NextResponse.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Error fetching domains' }, { status: 500 });
  }
}

export const GET = withPermission('domain_read')(getDomainsHandler);

async function createDomainHandler(request, { session }) {
  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }

    const domain = await prismaPostgres.domain.create({
      data: { name, description },
    });

    return NextResponse.json(domain);
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Domain already exists' }, { status: 400 });
    }
    console.error('Error creating domain:', error);
    return NextResponse.json({ error: 'Error creating domain' }, { status: 500 });
  }
}

export const POST = withPermission('domain_create')(createDomainHandler);

async function deleteDomainHandler(request, { session }) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 });
    }

    // Check if domain has users associated with it
    const domainWithRelations = await prismaPostgres.domain.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userDomains: true,
          },
        },
      },
    });

    if (domainWithRelations._count.userDomains > 0) {
      return NextResponse.json({ error: 'Cannot delete domain with existing users' }, { status: 400 });
    }

    await prismaPostgres.domain.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json({ error: 'Error deleting domain' }, { status: 500 });
  }
}

export const DELETE = withPermission('domain_delete')(deleteDomainHandler);
