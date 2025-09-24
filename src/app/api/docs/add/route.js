// src/app/api/docs/add/route.js
import { NextResponse } from 'next/server'
import { prismaMongo } from '@/lib/prismaMongo'

export async function POST(req) {
  try {
    const body = await req.json()
    const { title, content, domainId } = body

    if (!title || !content || !domainId) {
      return NextResponse.json(
        { error: 'Title, content, and domainId are required' },
        { status: 400 }
      )
    }

    // Insert new document into MongoDB
    const newDoc = await prismaMongo.doc.create({
      data: {
        title,
        content,
        domainId,
        createdAt: new Date(),
      },
    })

    return NextResponse.json(newDoc, { status: 201 })
  } catch (error) {
    console.error('Error adding document:', error)
    return NextResponse.json(
      { error: 'Failed to add document' },
      { status: 500 }
    )
  }
}
