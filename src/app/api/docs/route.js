import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prismaMongo } from '@/lib/prismaMongo'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.warn('Unauthorized access attempt to GET /api/docs')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.currentDomain?.userRole
    if (!role) {
      console.error('User role missing in session:', session)
      return NextResponse.json({ error: 'User role missing' }, { status: 400 })
    }

    // Get domainId from query parameter
    const url = new URL(request.url)
    const domainId = url.searchParams.get('domainId')

    let docs
    if (['doc_admin', 'superadmin'].includes(role)) {
      // Admins see all documents
      docs = await prismaMongo.doc.findMany({
        orderBy: { createdAt: 'desc' }
      })
    } else {
      if (!domainId) {
        return NextResponse.json({ error: 'domainId required' }, { status: 400 })
      }
      // Normal users see docs only for their domain
      docs = await prismaMongo.doc.findMany({
        where: { domainId },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(docs, { status: 200 })
  } catch (error) {
    console.error('GET /api/docs error:', error)
    return NextResponse.json({ error: error.message || 'Error fetching docs' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.warn('Unauthorized access attempt to POST /api/docs')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.currentDomain?.userRole
    if (!['site_admin', 'doc_admin', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, domainId } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Validate domain access for site_admin
    if (role === 'site_admin') {
      const hasAccess = session.user.userDomains?.some(
        (ud) => ud.domainId === domainId && ud.userRole === 'site_admin'
      )
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const doc = await prismaMongo.doc.create({
      data: {
        title,
        content,
        domainId: domainId || session.user.currentDomain.domainId,
        authorId: session.user.id
      }
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('POST /api/docs error:', error)
    return NextResponse.json({ error: error.message || 'Error creating doc' }, { status: 500 })
  }
}
