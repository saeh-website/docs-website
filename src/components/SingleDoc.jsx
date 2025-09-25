"use client";

import { useEffect } from "react";

export default function SingleDoc({ doc, onClose, canEdit = false, onEdit }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-start pt-20">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl font-bold"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-4">{doc.title}</h2>

        {/* Content */}
        <div
          className="prose max-w-none break-words"
          dangerouslySetInnerHTML={{ __html: doc.content }}
        />

        {/* Edit Button */}
        {canEdit && onEdit && (
          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                onClose();
                onEdit(doc);
              }}
              className="btn bg-button-color text-white hover:opacity-80"
            >
              تعديل
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
