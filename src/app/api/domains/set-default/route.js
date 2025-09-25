import { NextResponse } from 'next/server'
import { prismaPostgres } from '@/lib/prismaPostgres'
import { withAuth } from '@/lib/permission_handler';

async function setDefaultDomainHandler(req, { session }) {
  try {
    const { domainId } = await req.json()
    const userId = session.user.id

    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 })
    }

    // Find the UserDomain entry for this user and the selected domain
    const userDomain = await prismaPostgres.userDomain.findUnique({
      where: {
        userId_domainId: {
          userId: userId,
          domainId: domainId,
        },
      },
    });

    if (!userDomain) {
      return NextResponse.json({ error: 'User is not a member of this domain' }, { status: 403 });
    }

    // Set the user's currentDomainId to the ID of the found UserDomain entry
    await prismaPostgres.user.update({
      where: { id: userId },
      data: { currentDomainId: userDomain.id },
    });

    return NextResponse.json({ message: 'Default domain updated successfully' })
  } catch (error) {
    console.error('Failed to set default domain:', error)
    return NextResponse.json({ error: 'Failed to set default domain' }, { status: 500 })
  }
}

export const POST = withAuth(setDefaultDomainHandler);
