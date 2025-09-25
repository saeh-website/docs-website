"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Add, Edit, Delete } from "@mui/icons-material";
import Editor from "@/components/Editor";
import SingleDoc from "@/components/SingleDoc";

export default function DocsPage() {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [showSingleDoc, setShowSingleDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [domainId, setDomainId] = useState("");
  const [domains, setDomains] = useState([]);
  const [docs, setDocs] = useState([]);
  const [tab, setTab] = useState("published");

  const user = session?.user;
  const userRole = user?.currentDomain?.userRole?.toLowerCase();
  const isAdmin = ["superadmin", "doc_admin", "site_admin"].includes(userRole);

  useEffect(() => {
    if (user?.currentDomain?.domainId) {
      setDomains(user.userDomains || []);
      setDomainId(user.currentDomain.domainId);
      fetchDocs(user.currentDomain.domainId);
    }
  }, [user]);

  const fetchDocs = async (domainId) => {
    if (!domainId) return;
    try {
      const res = await axios.get(`/api/docs?domainId=${domainId}`);
      setDocs(res.data || []);
    } catch (err) {
      console.error("Fetch docs error:", err);
    }
  };

  const handleSave = async () => {
    if (!title || !domainId || !content) return alert("الرجاء تعبئة جميع الحقول");
    try {
      if (editingDoc) {
        await axios.put(`/api/docs/${editingDoc.id}`, { title, content, domainId });
      } else {
        await axios.post("/api/docs/add", { title, content, domainId });
      }
      fetchDocs(domainId);
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
      alert("حدث خطأ أثناء حفظ المستند");
    }
  };

  const handleDomainChange = (e) => {
    const selectedId = e.target.value;
    setDomainId(selectedId);
    setDocs([]);
    fetchDocs(selectedId);
  };

  const handleAddClick = () => setShowForm(true);

  const handleClose = () => {
    setShowForm(false);
    setEditingDoc(null);
    setTitle("");
    setContent("");
    setDomainId(user.currentDomain?.domainId || "");
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setDomainId(doc.domainId);
    setShowForm(true);
  };

  const handleSoftDelete = async (doc) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستند؟")) return;
    await axios.put(`/api/docs/${doc.id}`, { action: "soft-delete" });
    fetchDocs(domainId);
  };

  const handleRepublish = async (doc) => {
    await axios.put(`/api/docs/${doc.id}`, { action: "republish" });
    fetchDocs(domainId);
  };

  const handlePermanentDelete = async (doc) => {
    if (!confirm("هل تريد الحذف النهائي للمستند؟ لا يمكن التراجع!")) return;
    await axios.put(`/api/docs/${doc.id}`, { action: "permanent-delete" });
    fetchDocs(domainId);
  };

  const filteredDocs = docs.filter((d) => (tab === "published" ? !d.deleted : d.deleted));

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

      <div className="flex justify-center mb-4 space-x-4">
        <select value={domainId} onChange={handleDomainChange} className="form-control w-1/2">
          <option value="">اختر مجال</option>
          {domains.map((d) => (
            <option key={d.domainId} value={d.domainId}>
              {d.domain?.name || d.domainName || d.domainId}
            </option>
          ))}
        </select>
      </div>

      {isAdmin && (
        <div className="flex justify-center mb-4 space-x-4">
          <button
            className={`btn ${tab === "published" ? "bg-button-color text-white" : "bg-gray-300"}`}
            onClick={() => setTab("published")}
          >
            المنشورة
          </button>
          <button
            className={`btn ${tab === "deleted" ? "bg-button-color text-white" : "bg-gray-300"}`}
            onClick={() => setTab("deleted")}
          >
            المحذوفة
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filteredDocs.length === 0 && (
          <p className="text-center text-gray-500">لا توجد مستندات لهذا النطاق</p>
        )}

        {filteredDocs.map((doc) => {
          const textContent = doc.content.replace(/<[^>]+>/g, "");
          const preview = textContent.length > 100 ? textContent.slice(0, 100) + "..." : textContent;

          return (
            <div key={doc.id} className="border p-4 rounded shadow flex justify-between items-start">
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
                      <button onClick={() => handleEdit(doc)} className="btn bg-yellow-300 hover:opacity-80 flex items-center">
                        <Edit className="ml-1" /> تعديل
                      </button>
                      <button onClick={() => handleSoftDelete(doc)} className="btn bg-red-400 hover:opacity-80 flex items-center">
                        <Delete className="ml-1" /> حذف
                      </button>
                    </>
                  )}

                  {tab === "deleted" && (
                    <>
                      <button onClick={() => handleEdit(doc)} className="btn bg-yellow-300 hover:opacity-80 flex items-center">
                        <Edit className="ml-1" /> تعديل
                      </button>
                      <button onClick={() => handleRepublish(doc)} className="btn bg-green-400 hover:opacity-80 flex items-center">
                        إعادة النشر
                      </button>
                      {["superadmin", "doc_admin"].includes(userRole) && (
                        <button onClick={() => handlePermanentDelete(doc)} className="btn bg-red-600 hover:opacity-80 flex items-center">
                          حذف نهائي
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-start pt-24">
          <div className="bg-white p-6 rounded w-11/12 max-w-3xl space-y-4 relative">
            <h2 className="text-xl font-bold mb-2">{editingDoc ? "تعديل المستند" : "إضافة مستند جديد"}</h2>
            <Editor
              value={content}
              onChange={setContent}
              domains={domains}
              currentUserRole={userRole}
              currentUserDomains={user.userDomains}
              title={title}
              setTitle={setTitle}
              domainId={domainId}
              setDomainId={setDomainId}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={handleClose} className="btn bg-gray-300 text-black hover:opacity-80">إلغاء</button>
              <button onClick={handleSave} className="btn bg-button-color hover:opacity-80 text-white">حفظ</button>
            </div>
          </div>
        </div>
      )}

      {showSingleDoc && <SingleDoc doc={showSingleDoc} onClose={() => setShowSingleDoc(null)} />}
    </div>
  );
}
