'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import ReactQuill
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

import 'react-quill/dist/quill.snow.css';

export default function Editor({
  value,
  onChange,
  domains = [],
  currentUserRole = '',
  currentUserDomains = [],
  title,
  setTitle,
  domainIds = [],
  setDomainIds,
  visibleToRoles = [],
  setVisibleToRoles,
  availableRoles = [],
}) {
  const [content, setContent] = useState(value || '');

  useEffect(() => {
    setContent(value || '');
  }, [value]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
    onChange?.(newContent);
  };

  const handleDomainToggle = (domainId) => {
    if (domainIds.includes(domainId)) {
      setDomainIds(domainIds.filter((id) => id !== domainId));
    } else {
      setDomainIds([...domainIds, domainId]);
    }
  };

  const handleRoleToggle = (roleName) => {
    if (visibleToRoles.includes(roleName)) {
      setVisibleToRoles(visibleToRoles.filter((r) => r !== roleName));
    } else {
      setVisibleToRoles([...visibleToRoles, roleName]);
    }
  };

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Domains checkboxes */}
      <div className="form-group">
        <label>المجالات:</label>
        {domains.length > 0 ? (
          domains.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`domain-${d.id}`}
                checked={domainIds.includes(d.id)}
                onChange={() => handleDomainToggle(d.id)}
              />
              <label htmlFor={`domain-${d.id}`}>{d.domainName}</label>
            </div>
          ))
        ) : (
          <small className="text-red-600">لا توجد مجالات متاحة</small>
        )}
      </div>

      {/* Visible roles checkboxes */}
      <div className="form-group mt-3">
        <label>الأدوار:</label>
        {availableRoles.length > 0 ? (
          availableRoles.map((role) => (
            <div key={role.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`role-${role.id}`}
                checked={visibleToRoles.includes(role.name)}
                onChange={() => handleRoleToggle(role.name)}
              />
              <label htmlFor={`role-${role.id}`}>{role.name}</label>
            </div>
          ))
        ) : (
          <small className="text-red-600">لا توجد أدوار متاحة</small>
        )}
      </div>

      {/* Title input */}
      <div className="form-group mt-3">
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

      {/* Content editor */}
      <div className="form-group mt-3">
        <label>المحتوى:</label>
        <ReactQuill
          value={content}
          onChange={handleContentChange}
          theme="snow"
          style={{ direction: 'rtl', textAlign: 'right', minHeight: '200px' }}
          modules={{
            toolbar: [
              [{ header: '1' }, { header: '2' }, { font: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['bold', 'italic', 'underline', 'strike'],
              ['link', 'image'],
              ['clean'],
            ],
          }}
          formats={[
            'header',
            'font',
            'list',
            'bullet',
            'bold',
            'italic',
            'underline',
            'strike',
            'link',
            'image',
          ]}
        />
      </div>
    </div>
  );
}
