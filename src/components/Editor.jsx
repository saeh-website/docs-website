'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div>Loading editor...</div>
});

import 'react-quill/dist/quill.snow.css';

export default function Editor({ value, onChange, domains, currentUserRole, currentUserDomains }) {
  const [content, setContent] = useState(value || '');

  const handleContentChange = (newContent) => {
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'list', 'bullet',
    'bold', 'italic', 'underline', 'link', 'image'
  ];

  // Filter domains based on user role
  const availableDomains = domains.filter(domain => {
    if (currentUserRole === 'superadmin' || currentUserRole === 'doc_admin') {
      return true;
    }
    if (currentUserRole === 'site_admin') {
      return currentUserDomains.some(ud => 
        ud.domainId === domain.id && ud.userRole === 'site_admin'
      );
    }
    return false;
  });

  return (
    <div style={{ direction: 'rtl' }}>
      <div className="form-group">
        <label>المجال:</label>
        <select 
          name="domainId" 
          className="form-control"
          required
          disabled={availableDomains.length === 0}
        >
          <option value="">اختر مجال</option>
          {availableDomains.map(domain => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
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
          style={{ 
            direction: 'rtl',
            textAlign: 'right'
          }}
        />
      </div>

      <input type="hidden" name="content" value={content} />
    </div>
  );
}