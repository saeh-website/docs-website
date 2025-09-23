import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prismaPostgres } from '@/lib/prismaPostgres'

export async function POST(req) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { domainId } = await req.json()
  const userId = session.user.id

  if (!domainId) {
    return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 })
  }

  try {
    // Start a transaction to ensure atomicity
    await prismaPostgres.$transaction(async (prisma) => {
      // First, unset any existing default domain for the user
      await prisma.userDomain.updateMany({
        where: {
          userId: userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })

      // Then, set the new default domain
      await prisma.userDomain.update({
        where: {
          userId_domainId: {
            userId: userId,
            domainId: domainId,
          },
        },
        data: {
          isDefault: true,
        },
      })
    })

    return NextResponse.json({ message: 'Default domain updated successfully' })
  } catch (error) {
    console.error('Failed to set default domain:', error)
    return NextResponse.json({ error: 'Failed to set default domain' }, { status: 500 })
  }
}
