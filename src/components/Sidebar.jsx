"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Listen for toggle events from Navbar
  useEffect(() => {
    const handleToggle = (event) => {
      setIsOpen(event.detail.open);
    };

    window.addEventListener("toggleSidebar", handleToggle);
    return () => window.removeEventListener("toggleSidebar", handleToggle);
  }, []);
  const [selectedDomain, setSelectedDomain] = useState(
    session?.user?.currentDomain
  );

  useEffect(() => {
    setSelectedDomain(session?.user?.currentDomain);
  }, [session]);

  const handleDomainChange = async (domainId) => {
    const newDomain = session.user.userDomains.find(
      (ud) => ud.domainId === domainId
    );
    setSelectedDomain(newDomain);

    // Update session with new domain
    await update({
      ...session,
      user: {
        ...session.user,
        currentDomain: newDomain,
      },
    });

    // Refresh the page to show data according to new domain
    router.refresh();
  };

  if (!session) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="overlay"
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-profile">
          <img
            src={session.user.profilePicture}
            alt="Profile"
            onError={(e) => {
              e.target.src = "/images/default-avatar.png";
            }}
          />
          <p>Welcome {session.user.username}</p>
        </div>

        {/* Domain Selector */}
        {session.user.userDomains.length > 1 && (
          <div className="form-group">
            <select
              value={selectedDomain?.domainId || ""}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="form-control"
            >
              {session.user.userDomains.map((ud) => (
                <option key={ud.domainId} value={ud.domainId}>
                  {ud.domainName}
                </option>
              ))}
            </select>
          </div>
        )}

        <ul className="sidebar-links">
          <li>
            <a href="/docs">Docs</a>
          </li>
          {(session.user.currentDomain?.userRole === "site_admin" ||
            session.user.currentDomain?.userRole === "doc_admin" ||
            session.user.currentDomain?.userRole === "superadmin") && (
            <li>
              <a href="/users">Users</a>
            </li>
          )}
          {(session.user.currentDomain?.userRole === "doc_admin" ||
            session.user.currentDomain?.userRole === "superadmin") && (
            <li>
              <a href="/domains">Domains</a>
            </li>
          )}
          <li>
            <a href="/profile">Edit Profile</a>
          </li>
          <li>
            <button
              onClick={() => signOut()}
              className="btn"
              style={{ width: "100%" }}
            >
              Sign Out
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">فوذة و حكمة ... فوقه...</div>
      </div>
    </>
  );
}
