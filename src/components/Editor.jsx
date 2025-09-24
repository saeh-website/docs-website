'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div>Loading editor...</div>
});

import 'react-quill/dist/quill.snow.css';

export default function Editor({
  value,
  onChange,
  domains,
  currentUserRole,
  currentUserDomains,
  title,
  setTitle,
  domainId,
  setDomainId,
}) {
  const [content, setContent] = useState(value || '')

  useEffect(() => {
    setContent(value || '')
  }, [value])

  const handleContentChange = (newContent) => {
    setContent(newContent)
    if (onChange) onChange(newContent)
  }

  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline'],
      ['link', 'image'],
      ['clean']
    ],
  }

  const formats = [
    'header', 'font', 'list', 'bullet',
    'bold', 'italic', 'underline', 'link', 'image'
  ]

  // Filter domains based on role
  const availableDomains = domains.filter(d => {
    if (['superadmin', 'doc_admin'].includes(currentUserRole)) return true
    if (currentUserRole === 'site_admin') {
      return currentUserDomains.some(ud => ud.domainId === d.domainId && ud.userRole === 'site_admin')
    }
    return false
  })

  return (
    <div style={{ direction: 'rtl' }}>
      <div className="form-group">
        <label>المجال:</label>
        <select
          name="domainId"
          className="form-control"
          required
          value={domainId}
          onChange={(e) => setDomainId(e.target.value)}
        >
          <option value="">اختر مجال</option>
          {availableDomains.map(d => (
            <option key={d.domainId} value={d.domainId}>
              {d.domainName}
            </option>
          ))}
        </select>
        {availableDomains.length === 0 && (
          <small style={{ color: '#dc3545' }}>لا توجد مجالات متاحة للإضافة</small>
        )}
      </div>

      <div className="form-group">
        <label>العنوان:</label>
        <input
          type="text"
          name="title"
          className="form-control"
          placeholder="أدخل عنوان المستند"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>المحتوى:</label>
        <ReactQuill
          value={content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          theme="snow"
          style={{ direction: 'rtl', textAlign: 'right', minHeight: '200px' }}
        />
      </div>
    </div>
  )
}
