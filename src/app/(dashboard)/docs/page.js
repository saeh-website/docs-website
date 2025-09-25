"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Add } from "@mui/icons-material";
import Editor from "@/components/Editor";

export default function DocsPage() {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [domainId, setDomainId] = useState("");
  const [content, setContent] = useState("");
  const [domains, setDomains] = useState([]);
  const [docs, setDocs] = useState([]);

  const user = session?.user;
  const userRole = user?.currentDomain?.userRole?.toLowerCase();

  useEffect(() => {
    if (user) {
      setDomains(user.userDomains || []);
  
      // Pick default domain from userDomains
      const defaultDomain = user.userDomains?.find((d) => d.isDefault);
  
      if (defaultDomain) {
        setDomainId(defaultDomain.domainId);
        fetchDocs(defaultDomain.domainId);
      } else if (user.currentDomain?.domainId) {
        setDomainId(user.currentDomain.domainId);
        fetchDocs(user.currentDomain.domainId);
      }
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
    if (!title || !domainId || !content)
      return alert("الرجاء تعبئة جميع الحقول");
    try {
      await axios.post("/api/docs/add", { title, content, domainId });
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
    fetchDocs(selectedId);
  };

  const handleAddClick = () => setShowForm(true);
  const handleClose = () => {
    setShowForm(false);
    setTitle("");
    setContent("");
    setDomainId(user.currentDomain?.domainId || "");
  };

  return (
    <div className="p-6 relative">
      {["superadmin", "doc_admin", "site_admin"].includes(userRole) && (
        <div className="flex justify-center mb-4">
          <button onClick={handleAddClick} className="btn flex items-center">
            <Add className="ml-2" /> إضافة مستند
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-center">المستندات</h1>

      <div className="flex justify-center mb-6">
        <select
          value={domainId}
          onChange={handleDomainChange}
          className="form-control w-1/2"
        >
          <option value="">اختر مجال</option>
          {domains.map((d) => (
            <option key={d.domainId} value={d.domainId}>
              {d.domain?.name || d.domainName || d.domainId}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {docs.length === 0 && (
          <p className="text-center text-gray-500">
            لا توجد مستندات لهذا النطاق
          </p>
        )}
        {docs.map((doc) => (
          <div key={doc.id} className="border p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">{doc.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: doc.content }} />
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-start pt-24">
          <div className="bg-white p-6 rounded w-11/12 max-w-3xl space-y-4 relative">
            <h2 className="text-xl font-bold mb-2">إضافة مستند جديد</h2>
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
    </div>
  );
}
