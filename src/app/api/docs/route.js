import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prismaMongo } from '@/lib/prismaMongo'
import { prismaPostgres } from '@/lib/prismaPostgres'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let docs
    const role = session.user.currentDomain.userRole

    if (role === 'doc_admin' || role === 'superadmin') {
      docs = await prismaMongo.doc.findMany({
        orderBy: { createdAt: 'desc' }
      })
    } else {
      docs = await prismaMongo.doc.findMany({
        where: { domainId: session.user.currentDomain.domainId },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(docs)
  } catch (error) {
    console.error('Fetch docs error:', error)
    return NextResponse.json({ error: 'Error fetching docs' }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!['site_admin', 'doc_admin', 'superadmin'].includes(session.user.currentDomain.userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { title, content, domainId } = await request.json()

    // Validate domain access for site_admin
    if (session.user.currentDomain.userRole === 'site_admin') {
      const userDomain = session.user.userDomains.find(
        (ud) => ud.domainId === domainId && ud.userRole === 'site_admin'
      )
      if (!userDomain) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const doc = await prismaMongo.doc.create({
      data: {
        title,
        content,
        domainId: domainId || session.user.currentDomain.domainId,
        authorId: session.user.id,
        createdAt: new Date()
      }
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('Create doc error:', error)
    return NextResponse.json({ error: 'Error creating doc' }, { status: 500 })
  }
}
