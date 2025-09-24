"use client";

import { useSession } from "next-auth/react";

export default function Navbar({ toggleSidebar }) {
  const { data: session, status } = useSession();

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <nav
      className="fixed top-0 right-0 left-0 z-50"
      style={{ backgroundColor: "var(--navbar-bg-color)" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center h-20">
          {/* ✅ Centered & Responsive Title */}
          <h1 className="text-white font-bold absolute left-1/2 transform -translate-x-1/2 
                         text-xl sm:text-2xl truncate max-w-[70%] text-center">
            SAEH Documentation
          </h1>

          {/* ✅ Hamburger Menu on the Right */}
          <div className="absolute right-0 flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300"
              aria-label="Toggle menu"
            >
              <svg
                className="h-8 w-8"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
