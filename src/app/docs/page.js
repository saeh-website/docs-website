"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

// ✅ Dynamically import Quill (avoids SSR issues)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function DocsPage() {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [domainId, setDomainId] = useState("");
  const [content, setContent] = useState("");

  const userRole = session?.user?.currentDomain?.userRole?.toLowerCase();
  const allowedRoles = ["superadmin", "doc_admin", "site_admin"];
  const canAddDocs = allowedRoles.includes(userRole);

  const handleSave = async () => {
    const res = await fetch("/api/docs/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, domainId, content }),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Document added successfully!");
      setTitle("");
      setContent("");
    } else {
      alert("❌ " + data.error);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Documentation</h1>

      {canAddDocs && (
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl mb-4">Add New Document</h2>

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-4 text-black rounded"
          />

          <select
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            className="w-full p-2 mb-4 text-black rounded"
          >
            <option value="">Select Domain</option>
            {session?.user?.userDomains?.map((d) => (
              <option key={d.domainId} value={d.domainId}>
                {d.domainName}
              </option>
            ))}
          </select>

          <ReactQuill
            value={content}
            onChange={setContent}
            className="mb-4 bg-white text-black rounded"
            theme="snow"
          />

          <button
            onClick={handleSave}
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
