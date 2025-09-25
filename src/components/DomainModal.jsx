"use client";

import { useState } from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DomainModal({ isOpen, onClose }) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleDomainSelection = async (domain) => {
    try {
      setError("");
      // Update the session with the new current domain
      const newSession = await update({
        ...session,
        user: {
          ...session.user,
          currentDomain: domain,
          requiresDomainSelection: false,
        },
      });

      if (newSession) {
        onClose(); // Close the modal
        // Optionally refresh the page to show updated domain
        window.location.reload();
      } else {
        setError("Failed to update session. Please try again.");
      }
    } catch (err) {
      setError("Failed to select domain. Please try again.");
    }
  };

  const handleSetDefault = async (domainId) => {
    setError("");
    try {
      const res = await fetch("/api/domains/set-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      });

      if (!res.ok) {
        throw new Error("Failed to set default domain");
      }

      // Show success message
      alert("تم تعيين النطاق الافتراضي بنجاح!");

      // Refresh the session to get the latest user data
      await getSession();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#191919]">اختر النطاق</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {session?.user.userDomains?.map((domain) => (
            <div
              key={domain.domainId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <span className="text-lg">{domain.domainName}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDomainSelection(domain)}
                  className="bg-[#e01f26] text-white font-bold py-2 px-4 rounded-lg hover:opacity-80 transition-opacity duration-300"
                >
                  اختيار
                </button>
                <button
                  onClick={() => handleSetDefault(domain.domainId)}
                  className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300"
                >
                  تعيين كافتراضي
                </button>
              </div>
            </div>
          ))}
        </div>

        {session?.user.userDomains?.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            لا توجد نطاقات متاحة
          </div>
        )}
      </div>
    </div>
  );
}
