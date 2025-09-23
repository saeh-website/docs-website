"use client";

import { useSession } from "next-auth/react";

export default function Navbar({ toggleSidebar }) {
  const { data: session, status } = useSession();

  // Do not render the navbar on the login page or while session is loading
  if (status === "loading" || !session) {
    return null;
  }

  return (
    <nav
      className="fixed top-0 right-0 left-0 z-50"
      style={{ backgroundColor: "var(--navbar-bg-color)" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <h1 className="text-white text-2xl font-bold">
              SAEH Documentation
            </h1>
          </div>
          <div className="flex items-center">
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
