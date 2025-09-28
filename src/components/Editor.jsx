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

  const handleRoleToggle = (role) => {
    if (visibleToRoles.includes(role)) {
      setVisibleToRoles(visibleToRoles.filter((r) => r !== role));
    } else {
      setVisibleToRoles([...visibleToRoles, role]);
    }
  };

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Domains checkboxes */}
      <div className="form-group">
        <label>المجالات:</label>
        {domains.map((d) => (
          <div key={d.domainId} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`domain-${d.domainId}`}
              checked={domainIds.includes(d.domainId)}
              onChange={() => handleDomainToggle(d.domainId)}
            />
            <label htmlFor={`domain-${d.domainId}`}>{d.domainName}</label>
          </div>
        ))}
      </div>

      {/* Visible roles checkboxes */}
      <div className="form-group mt-3">
        <label>الأدوار المسموح لها:</label>
        {availableRoles.map((role) => (
          <div key={role} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`role-${role}`}
              checked={visibleToRoles.includes(role)}
              onChange={() => handleRoleToggle(role)}
            />
            <label htmlFor={`role-${role}`}>{role}</label>
          </div>
        ))}
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
