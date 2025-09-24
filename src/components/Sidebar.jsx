"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Sidebar({ isOpen, toggle }) {
  console.log("Sidebar component is rendering");

  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const user = session?.user;
  if (!user) {
    return null; // session expired / invalid
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const navLinkClasses = "block text-white text-lg hover:underline py-2";

  // ✅ Directly from backend-provided field
  const userRole = user.role?.toLowerCase() || "";

  console.log("Sidebar → user object:", user);
  console.log("Sidebar → role:", userRole);

  return (
    <>
      {/* Debug UI (safe to remove in prod) */}
      <p style={{ color: "red" }}>
        DEBUG ROLE: {user.role} | normalized: {userRole}
      </p>

      <div
        className={`
          h-full overflow-y-auto transition-all duration-300 ease-in-out
          fixed md:relative z-40 top-0 right-0
          ${isOpen ? "w-[250px] translate-x-0" : "w-0 translate-x-full"}
          md:translate-x-0
        `}
        style={{ backgroundColor: "var(--sidebar-bg-color)" }}
      >
        <div className="p-8 text-center text-white">
          {/* Profile */}
          <div className="flex justify-center mb-4">
            <Image
              src={user.profilePicture || "/images/default-avatar.png"}
              alt="Profile Picture"
              width={80}
              height={80}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.src = "/images/default-avatar.png";
              }}
            />
          </div>

          <h2 className="text-xl mb-2">مرحباً {user.username}</h2>

          {/* Current domain */}
          <div className="mb-4">
            <p className="text-sm">
              النطاق الحالي: {user.currentDomain?.domainName}
            </p>
            <Link
              href="#"
              className="text-sm hover:underline"
              style={{ color: "var(--link-color)" }}
            >
              (تغيير)
            </Link>
          </div>

          {/* Navigation */}
          <nav>
            <Link
              href="/profile/edit"
              className={navLinkClasses}
              style={{ fontSize: "1rem" }}
            >
              تعديل الملف الشخصي
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full bg-[#e01f26] text-white font-bold py-2 px-4 rounded-lg hover:opacity-80 transition-opacity duration-300 my-4"
            >
              تسجيل الخروج
            </button>

            <hr className="border-t border-gray-500 my-4" />

            <Link href="/docs" className={navLinkClasses}>
              Docs
            </Link>

            {/* ✅ Role-based visibility */}
            {["site_admin", "doc_admin", "superadmin"].includes(userRole) && (
              <Link href="/users" className={navLinkClasses}>
                المستخدمون
              </Link>
            )}

            {["doc_admin", "superadmin"].includes(userRole) && (
              <Link href="/domains" className={navLinkClasses}>
                النطاقات
              </Link>
            )}
          </nav>

          {/* Footer */}
          <footer className="absolute bottom-8 right-0 left-0 text-center text-sm">
            <p>ابو الهول دايماً… قوة و حكمة</p>
          </footer>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full z-30 bg-black opacity-50 md:hidden"
          onClick={toggle}
        />
      )}
    </>
  );
}
