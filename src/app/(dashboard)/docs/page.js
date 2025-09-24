'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { Add } from '@mui/icons-material'
import Editor from '@/components/Editor' // import your Editor component

export default function DocsPage() {
  const { data: session } = useSession()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [domainId, setDomainId] = useState('')
  const [content, setContent] = useState('')
  const [domains, setDomains] = useState([])
  const [docs, setDocs] = useState([])

  const user = session?.user
  const userRole = user?.currentDomain?.userRole?.toLowerCase()

  useEffect(() => {
    if (user) {
      setDomains(user.userDomains || [])
      setDomainId(user.currentDomain?.domainId || '')
      fetchDocs(user.currentDomain?.domainId)
    }
  }, [user])

  const fetchDocs = async (domainId) => {
    if (!domainId) return
    try {
      const res = await axios.get(`/api/docs?domainId=${domainId}`)
      setDocs(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddClick = () => setShowForm(true)
  const handleClose = () => {
    setShowForm(false)
    setTitle('')
    setContent('')
    setDomainId(user.currentDomain?.domainId || '')
  }

  const handleSave = async () => {
    if (!title || !domainId || !content) return alert('الرجاء تعبئة جميع الحقول')
    try {
      await axios.post('/api/docs/add', { title, domainId, content })
      fetchDocs(domainId)
      handleClose()
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء حفظ المستند')
    }
  }

  const handleDomainChange = (e) => {
    const selectedId = e.target.value
    setDomainId(selectedId)
    fetchDocs(selectedId)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">المستندات</h1>

      {/* Add Doc Button */}
      {['superadmin', 'doc_admin', 'site_admin'].includes(userRole) && (
        <div className="flex justify-center mb-4">
          <button
            onClick={handleAddClick}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Add className="mr-2" /> إضافة مستند
          </button>
        </div>
      )}

      {/* Domain Selector */}
      <div className="flex justify-center mb-6">
        <select
          value={domainId}
          onChange={handleDomainChange}
          className="border px-2 py-1 rounded"
        >
          {domains.map((d) => (
            <option key={d.domainId} value={d.domainId}>
              {d.domainName}
            </option>
          ))}
        </select>
      </div>

      {/* Docs List */}
      <div className="space-y-4">
        {docs.length === 0 && <p className="text-center text-gray-500">لا توجد مستندات لهذا النطاق</p>}
        {docs.map((doc) => (
          <div key={doc.id} className="border p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">{doc.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: doc.content }} />
          </div>
        ))}
      </div>

      {/* Add Doc Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-11/12 max-w-3xl space-y-4 relative">
            <h2 className="text-xl font-bold mb-2">إضافة مستند جديد</h2>

            <Editor
              value={content}
              onChange={setContent}
              domains={domains}
              currentUserRole={userRole}
              currentUserDomains={user.userDomains}
            />

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
