"use client";
import { useSession } from "next-auth/react";
import { Menu } from "@mui/icons-material";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session) return null;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // Dispatch custom event to communicate with Sidebar
    window.dispatchEvent(
      new CustomEvent("toggleSidebar", { detail: { open: !sidebarOpen } })
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div style={{ display: "flex", alignItems: "center" }}>
          <Menu className="hamburger-menu" onClick={toggleSidebar} />
          <h1 className="navbar-title">SAEH Website Documentation</h1>
        </div>
      </div>
    </nav>
  );
}
