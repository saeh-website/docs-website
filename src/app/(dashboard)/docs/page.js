'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Add } from '@mui/icons-material'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

export default function DocsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-right">المستندات</h1>
      <p className="text-right text-lg">
        هنا سيتم عرض قائمة بالمستندات بناءً على دور المستخدم والنطاق المحدد.
      </p>
      {/* "Add Doc" button will be added here later based on user role */}
    </div>
  )
}