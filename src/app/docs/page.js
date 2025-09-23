'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Add } from '@mui/icons-material'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

export default function Docs() {
  const { data: session } = useSession()
  const [docs, setDocs] = useState([])
  const [showEditor, setShowEditor] = useState(false)
  const [newDoc, setNewDoc] = useState({ title: '', content: '', domainId: '' })

  const canEdit = ['site_admin', 'doc_admin', 'superadmin'].includes(
    session?.user?.currentDomain?.userRole
  )

  useEffect(() => {
    fetchDocs()
  }, [session])

  const fetchDocs = async () => {
    try {
      const response = await fetch('/api/docs')
      if (response.ok) {
        const data = await response.json()
        setDocs(data)
      }
    } catch (error) {
      console.error('Error fetching docs:', error)
    }
  }

  const handleAddDoc = async () => {
    try {
      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDoc),
      })

      if (response.ok) {
        setShowEditor(false)
        setNewDoc({ title: '', content: '', domainId: '' })
        fetchDocs()
      }
    } catch (error) {
      console.error('Error adding doc:', error)
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Documentation</h1>
        {canEdit && (
          <button 
            className="btn"
            onClick={() => setShowEditor(true)}
          >
            <Add /> Add Doc
          </button>
        )}
      </div>

      {showEditor && (
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={newDoc.title}
              onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Content:</label>
            <ReactQuill
              value={newDoc.content}
              onChange={(content) => setNewDoc({ ...newDoc, content })}
              modules={{
                toolbar: [
                  [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['bold', 'italic', 'underline'],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button className="btn" onClick={handleAddDoc}>
              Save
            </button>
            <button 
              className="btn" 
              onClick={() => setShowEditor(false)}
              style={{ backgroundColor: '#6c757d' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>
        {docs.map(doc => (
          <div key={doc.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
            <h3>{doc.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: doc.content }} />
            {canEdit && (
              <button className="btn" style={{ marginTop: '1rem' }}>
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}