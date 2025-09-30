"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

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
  availableRoles = [], // array of { id, name }
}) {
  // local content state (controlled by parent via onChange)
  const [content, setContent] = useState(value || "");

  useEffect(() => {
    setContent(value || "");
  }, [value]);

  // ensure parent setters exist (defensive)
  const safeSetDomainIds = (fnOrArray) => {
    if (typeof setDomainIds === "function") {
      setDomainIds(fnOrArray);
    } else {
      console.warn("Editor: setDomainIds not provided or not a function");
    }
  };

  const safeSetVisibleToRoles = (fnOrArray) => {
    if (typeof setVisibleToRoles === "function") {
      setVisibleToRoles(fnOrArray);
    } else {
      console.warn("Editor: setVisibleToRoles not provided or not a function");
    }
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    onChange?.(newContent);
  };

  // toggle domain id (store strings)
  const handleDomainToggle = (id) => {
    const sid = String(id);
    safeSetDomainIds((prev = []) => {
      const prevStrings = prev.map(String);
      const next = prevStrings.includes(sid) ? prevStrings.filter((x) => x !== sid) : [...prevStrings, sid];
      console.debug("Editor: domain toggle", { id: sid, next });
      return next;
    });
  };

  // toggle role id (store strings)
  const handleRoleToggle = (id) => {
    const sid = String(id);
    safeSetVisibleToRoles((prev = []) => {
      const prevStrings = prev.map(String);
      const next = prevStrings.includes(sid) ? prevStrings.filter((x) => x !== sid) : [...prevStrings, sid];
      console.debug("Editor: role toggle", { id: sid, next });
      return next;
    });
  };

  return (
    <div style={{ direction: "rtl" }}>
      {/* Domains checkboxes */}
      <div className="form-group">
        <label>المجالات:</label>
        {domains.length > 0 ? (
          domains.map((d) => {
            const sid = String(d.id);
            const checked = Array.isArray(domainIds) && domainIds.map(String).includes(sid);
            return (
              <div key={sid} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`domain-${sid}`}
                  value={sid}
                  checked={checked}
                  onChange={() => handleDomainToggle(sid)}
                />
                <label htmlFor={`domain-${sid}`}>{d.name}</label>
              </div>
            );
          })
        ) : (
          <small className="text-red-600">لا توجد مجالات متاحة</small>
        )}
      </div>

      {/* Roles checkboxes */}
      <div className="form-group mt-3">
        <label>الأدوار:</label>
        {availableRoles.length > 0 ? (
          availableRoles.map((role) => {
            const rid = String(role.id);
            const checked = Array.isArray(visibleToRoles) && visibleToRoles.map(String).includes(rid);
            return (
              <div key={rid} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`role-${rid}`}
                  value={rid}
                  checked={checked}
                  onChange={() => handleRoleToggle(rid)}
                />
                <label htmlFor={`role-${rid}`}>{role.name}</label>
              </div>
            );
          })
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

      {/* Content (Quill) */}
      <div className="form-group mt-3">
        <label>المحتوى:</label>
        <ReactQuill
          value={content}
          onChange={handleContentChange}
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
