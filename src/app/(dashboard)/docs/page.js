"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Add, Edit, Delete } from "@mui/icons-material";
import Editor from "@/components/Editor";
import SingleDoc from "@/components/SingleDoc";

export default function DocsPage() {
  const { data: session } = useSession();

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [showSingleDoc, setShowSingleDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [tab, setTab] = useState("published");
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    doc: null,
    action: null,
  });

  // Form state (for editor)
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedDomainIds, setSelectedDomainIds] = useState([]); // multi for editor
  const [visibleToRoles, setVisibleToRoles] = useState([]);

  // Filter state
  const [filterDomainId, setFilterDomainId] = useState(""); // dropdown filter

  // Data
  const [domains, setDomains] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]); // {id, name}
  const [docs, setDocs] = useState([]);

  const user = session?.user;
  const userRole = user?.currentDomain?.roleName?.toLowerCase?.();
  const isAdmin = ["superadmin", "doc_admin", "site_admin"].includes(userRole);

  // Load domains from user (map to {id,name})
  useEffect(() => {
    if (user?.userDomains) {
      const mapped = user.userDomains.map((ud) => ({
        id: String(ud.domainId),
        name: ud.domain?.name || ud.domainName || `Domain ${ud.domainId}`,
      }));
      setDomains(mapped);

      if (user.currentDomain?.domain?.id) {
        const currentId = String(user.currentDomain.domain.id);
        setFilterDomainId(currentId);
        fetchDocs(currentId);
      }
    }
  }, [user]);

  // Load available roles from backend (/api/user-roles)
  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await axios.get("/api/user-roles");
        const normalized = (res.data || []).map((r) => ({
          id: String(r.id),
          name: r.name || `Role ${r.id}`,
        }));
        setAvailableRoles(normalized);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    }
    fetchRoles();
  }, []);

  // Fetch docs for a domain
  const fetchDocs = async (domainId) => {
    if (!domainId) return;
    try {
      const res = await axios.get(`/api/docs?domainId=${domainId}`);
      setDocs(res.data || []);
    } catch (err) {
      console.error("Error fetching docs", err);
    }
  };

  // Save (add or update)
  const handleSave = async () => {
    if (!title || !content || selectedDomainIds.length === 0) {
      return alert("الرجاء تعبئة جميع الحقول");
    }
    try {
      if (editingDoc) {
        await axios.put(`/api/docs/${editingDoc.id}`, {
          title,
          content,
          domainIds: selectedDomainIds,
          visibleToRoles,
        });
      } else {
        await axios.post("/api/docs/add", {
          title,
          content,
          domainIds: selectedDomainIds,
          visibleToRoles,
        });
      }
      if (filterDomainId) fetchDocs(filterDomainId);
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
      alert("حدث خطأ أثناء حفظ المستند");
    }
  };

  const handleAddClick = () => {
    resetForm();
    // when creating a new doc, pre-select the current filter domain for convenience
    if (filterDomainId) setSelectedDomainIds([filterDomainId]);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingDoc(null);
    setTitle("");
    setContent("");
    setSelectedDomainIds([]);
    setVisibleToRoles([]);
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setTitle(doc.title || "");
    setContent(doc.content || "");

    // Normalize domainIds (handle both object or primitive cases)
    const normalizedDomainIds = (doc.domainIds || []).map((d) =>
      typeof d === "object" && d !== null ? String(d.id) : String(d)
    );
    setSelectedDomainIds(normalizedDomainIds);

    // Normalize visibleToRoles
    const normalizedRoles = (doc.visibleToRoles || []).map((r) =>
      typeof r === "object" && r !== null ? String(r.id) : String(r)
    );
    setVisibleToRoles(normalizedRoles);

    setShowForm(true);
  };

  const handleRepublish = async (doc) => {
    try {
      await axios.put(`/api/docs/${doc.id}`, { action: "restore" });
      if (filterDomainId) fetchDocs(filterDomainId);
    } catch (err) {
      console.error("Republish error:", err);
      alert("حدث خطأ أثناء إعادة نشر المستند");
    }
  };

  const openConfirmModal = (doc, action) =>
    setConfirmModal({ show: true, doc, action });
  const closeConfirmModal = () =>
    setConfirmModal({ show: false, doc: null, action: null });

  const confirmAction = async () => {
    if (!confirmModal.doc || !confirmModal.action) return;
    try {
      await axios.put(`/api/docs/${confirmModal.doc.id}`, {
        action: confirmModal.action,
      });
      if (filterDomainId) fetchDocs(filterDomainId);
      closeConfirmModal();
    } catch (err) {
      console.error("Confirm action error:", err);
      alert("حدث خطأ أثناء تنفيذ العملية");
    }
  };

  const filteredDocs = docs.filter((d) =>
    tab === "published" ? !d.deleted : d.deleted
  );

  return (
    <div className="p-6">
      {isAdmin && (
        <div className="flex justify-center mb-4">
          <button onClick={handleAddClick} className="btn flex items-center">
            <Add className="ml-2" /> إضافة مستند
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4 text-center">المستندات</h1>

      {/* Small debug panel to inspect data (remove or hide in production) */}
      <div className="bg-gray-100 border p-2 my-4 text-xs overflow-x-auto">
        <strong>Debug state</strong>
        <pre>
          {JSON.stringify(
            {
              filterDomainId,
              selectedDomainIds,
              visibleToRoles,
              availableRoles,
            },
            null,
            2
          )}
        </pre>
      </div>

      {/* Domain select (filter) */}
      <div className="flex justify-center mb-4 space-x-4">
        <select
          value={filterDomainId}
          onChange={(e) => {
            const id = e.target.value;
            setFilterDomainId(id);
            setDocs([]);
            if (id) fetchDocs(id);
          }}
          className="form-control w-1/2"
        >
          <option value="">اختر مجال</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      {isAdmin && (
        <div className="flex justify-center mb-4 space-x-4">
          <button
            className={`btn ${
              tab === "published" ? "bg-button-color text-white" : "bg-gray-300"
            }`}
            onClick={() => setTab("published")}
          >
            المنشورة
          </button>
          <button
            className={`btn ${
              tab === "deleted" ? "bg-button-color text-white" : "bg-gray-300"
            }`}
            onClick={() => setTab("deleted")}
          >
            المحذوفة
          </button>
        </div>
      )}

      {/* Docs list */}
      <div className="space-y-4">
        {filteredDocs.length === 0 && (
          <p className="text-center text-gray-500">لا توجد مستندات</p>
        )}
        {filteredDocs.map((doc) => {
          const textContent = (doc.content || "").replace(/<[^>]+>/g, "");
          const preview =
            textContent.length > 100
              ? textContent.slice(0, 100) + "..."
              : textContent;

          return (
            <div
              key={doc.id}
              className="border p-4 rounded shadow flex justify-between items-start"
            >
              <div>
                <h1
                  className="font-bold text-lg mb-2 cursor-pointer text-blue-600 hover:underline"
                  onClick={() => setShowSingleDoc(doc)}
                >
                  {doc.title}
                </h1>
                <p className="text-gray-700">{preview}</p>
              </div>

              {isAdmin && (
                <div className="flex flex-col space-y-2 ml-4">
                  {tab === "published" && (
                    <>
                      <button
                        onClick={() => handleEdit(doc)}
                        className="btn bg-yellow-300 hover:opacity-80 flex items-center"
                      >
                        <Edit className="ml-1" /> تعديل
                      </button>
                      <button
                        onClick={() => openConfirmModal(doc, "soft-delete")}
                        className="btn bg-red-400 hover:opacity-80 flex items-center"
                      >
                        <Delete className="ml-1" /> حذف
                      </button>
                    </>
                  )}
                  {tab === "deleted" && (
                    <>
                      <button
                        onClick={() => handleEdit(doc)}
                        className="btn bg-yellow-300 hover:opacity-80 flex items-center"
                      >
                        <Edit className="ml-1" /> تعديل
                      </button>
                      <button
                        onClick={() => handleRepublish(doc)}
                        className="btn bg-green-400 hover:opacity-80 flex items-center"
                      >
                        إعادة النشر
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Editor modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-start pt-24">
          <div className="bg-white p-6 rounded w-11/12 max-w-3xl space-y-4 relative">
            <h2 className="text-xl font-bold mb-2">
              {editingDoc ? "تعديل المستند" : "إضافة مستند جديد"}
            </h2>
            <Editor
              value={content}
              onChange={setContent}
              domains={domains}
              title={title}
              setTitle={setTitle}
              domainIds={selectedDomainIds}
              setDomainIds={setSelectedDomainIds}
              visibleToRoles={visibleToRoles}
              setVisibleToRoles={setVisibleToRoles}
              availableRoles={availableRoles}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleClose}
                className="btn bg-gray-300 text-black hover:opacity-80"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="btn bg-button-color hover:opacity-80 text-white"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SingleDoc modal */}
      {showSingleDoc && (
        <SingleDoc doc={showSingleDoc} onClose={() => setShowSingleDoc(null)} />
      )}

      {/* Confirm modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96 space-y-4">
            <h2 className="text-lg font-bold">تأكيد العملية</h2>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={closeConfirmModal}
                className="btn bg-gray-300 text-black hover:opacity-80"
              >
                إلغاء
              </button>
              <button
                onClick={confirmAction}
                className="btn bg-red-500 hover:opacity-80 text-white"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
