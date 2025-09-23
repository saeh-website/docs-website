"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Sidebar({ isOpen, toggle }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>; // Or a spinner component
  }

  // Use session data instead of placeholder
  const user = session?.user;

  if (!user) {
    // This could happen if the session is invalid or expired
    // You might want to redirect to login here
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/"); // Redirect to login page after sign out
  };

  const navLinkClasses = "block text-white text-lg hover:underline py-2";
  const userRole = (user.role || user.currentDomain?.userRole || "").toLowerCase();
 // Use the role from the current domain


 console.log("Sidebar → user:", user);
console.log("Sidebar → resolved role:", userRole);
  return (
    <>
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
          </div >
          <h2 className="text-xl mb-2" style={{ color: "white" }}>مرحباً {user.username}</h2>
          <div className="mb-4">
            <p className="text-sm">
              النطاق الحالي: {user.currentDomain?.domainName}
            </p>
            {/* Domain change functionality will be implemented later */}
            <Link
              href="#"
              className="text-sm hover:underline"
              style={{ color: "var(--link-color)" }}
            >
              (تغيير)
            </Link>
          </div>

          <nav>
            <Link href="/profile/edit" className={navLinkClasses} style={{ fontSize: "1rem" }}>
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
              المستندات
            </Link>

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

          <footer className="absolute bottom-8 right-0 left-0 text-center text-sm">
            <p>ابو الهول دايماً… قوة و حكمة</p>
          </footer>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full z-30 bg-black opacity-50 md:hidden"
          onClick={toggle}
        ></div>
      )}
    </>
  );
}
