"use client";

import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function Editor({
  value,
  onChange,
  domains = [],
  title,
  setTitle,
  domainIds = [],
  setDomainIds,
  visibleToRoles = [],
  setVisibleToRoles,
  availableRoles = [],
}) {
  // Toggle domain
  const handleDomainToggle = (id) => {
    const stringId = String(id);
    setDomainIds((prev) =>
      prev.includes(stringId) ? prev.filter((d) => d !== stringId) : [...prev, stringId]
    );
  };

  // Toggle role
  const handleRoleToggle = (id) => {
    const stringId = String(id);
    setVisibleToRoles((prev) =>
      prev.includes(stringId) ? prev.filter((r) => r !== stringId) : [...prev, stringId]
    );
  };

  return (
    <div style={{ direction: "rtl" }}>
      {/* Domains checkboxes */}
      <div className="form-group">
        <label>المجالات:</label>
        {domains.length > 0 ? (
          domains.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`domain-${d.id}`}
                checked={domainIds.includes(String(d.id))}
                onChange={() => handleDomainToggle(d.id)}
              />
              <label htmlFor={`domain-${d.id}`}>{d.name}</label>
            </div>
          ))
        ) : (
          <small className="text-red-600">لا توجد مجالات متاحة</small>
        )}
      </div>

      {/* Roles checkboxes */}
      <div className="form-group mt-3">
        <label>الأدوار:</label>
        {availableRoles.length > 0 ? (
          availableRoles.map((role) => (
            <div key={role.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`role-${role.id}`}
                checked={visibleToRoles.includes(String(role.id))}
                onChange={() => handleRoleToggle(role.id)}
              />
              <label htmlFor={`role-${role.id}`}>{role.name}</label>
            </div>
          ))
        ) : (
          <small className="text-red-600">لا توجد أدوار متاحة</small>
        )}
      </div>

      {/* Title */}
      <div className="form-group mt-3">
        <label>العنوان:</label>
        <input
          type="text"
          className="form-control"
          placeholder="أدخل عنوان المستند"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="form-group mt-3">
        <label>المحتوى:</label>
        <ReactQuill
          value={value}
          onChange={onChange}
          theme="snow"
          style={{ direction: "rtl", textAlign: "right", minHeight: "200px" }}
          modules={{
            toolbar: [
              [{ header: "1" }, { header: "2" }, { font: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              ["bold", "italic", "underline", "strike"],
              ["link", "image"],
              ["clean"],
            ],
          }}
        />
      </div>
    </div>
  );
}
