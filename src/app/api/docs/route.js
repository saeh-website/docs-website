import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prismaMongo } from '@/lib/prismaMongo'
import { prismaPostgres } from '@/lib/prismaPostgres'

export async function GET(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    let docs
    if (session.user.currentDomain.userRole === 'doc_admin' || session.user.currentDomain.userRole === 'superadmin') {
      // Show all docs for admins
      docs = await prismaMongo.doc.findMany({
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Show docs only for user's domain and role
      docs = await prismaMongo.doc.findMany({
        where: {
          domainId: session.user.currentDomain.domainId
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return Response.json(docs)
  } catch (error) {
    return new Response('Error fetching docs', { status: 500 })
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!['site_admin', 'doc_admin', 'superadmin'].includes(session.user.currentDomain.userRole)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const { title, content, domainId } = await request.json()

    // Validate domain access
    if (session.user.currentDomain.userRole === 'site_admin') {
      const userDomain = session.user.userDomains.find(ud => 
        ud.domainId === domainId && ud.userRole === 'site_admin'
      )
      if (!userDomain) {
        return new Response('Forbidden', { status: 403 })
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

    return Response.json(doc)
  } catch (error) {
    return new Response('Error creating doc', { status: 500 })
  }
}