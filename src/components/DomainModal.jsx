"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function DomainModal({ isOpen, onClose }) {
  const { data: session, update } = useSession();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDomainSelection = async (userDomain) => {
    try {
      setError("");
      setIsLoading(true);

      // First, update the backend with the new current domain
      const response = await fetch("/api/domains/set-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: userDomain.domain.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update current domain");
      }

      // Fetch fresh user data from our custom refresh endpoint
      const userResponse = await fetch("/api/auth/refresh-user", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to refresh user data");
      }

      const refreshedUserData = await userResponse.json();

      console.log("Refreshed user data:", refreshedUserData);

      // Update the session with fresh user data
      await update({
        ...session,
        user: refreshedUserData,
      });

      setIsLoading(false);
      onClose(); // Close the modal
    } catch (err) {
      console.error("Domain selection error:", err);
      setError("Failed to select domain. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#191919]">اختر النطاق</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`text-2xl font-bold ${
              isLoading
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            جاري تحديث النطاق...
          </div>
        )}

        <div className="space-y-4">
          {session?.user.userDomains?.map((userDomain) => {
            const isCurrentDomain =
              userDomain.id === session?.user.currentDomain?.id;
            return (
              <div
                key={userDomain.id}
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                  isCurrentDomain ? "border-[#e01f26] bg-red-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{userDomain.domain.name}</span>
                  {isCurrentDomain && (
                    <span className="text-sm bg-[#e01f26] text-white px-2 py-1 rounded">
                      النطاق الحالي
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDomainSelection(userDomain)}
                    disabled={isCurrentDomain || isLoading}
                    className={`font-bold py-2 px-4 rounded-lg transition-opacity duration-300 ${
                      isCurrentDomain
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : isLoading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-[#e01f26] text-white hover:opacity-80"
                    }`}
                  >
                    {isLoading
                      ? "جاري التحديث..."
                      : isCurrentDomain
                      ? "مُختار"
                      : "اختيار"}
                  </button>
                </div>
              </div>
            );
          })}
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
