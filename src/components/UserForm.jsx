"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Add, Remove } from "@mui/icons-material";

export default function UserForm({ onUserAdded }) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    profilePicture: null,
    domains: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAddDomain = () => {
    setFormData((prev) => ({
      ...prev,
      domains: [...prev.domains, { domainId: "", userRole: "editor" }],
    }));
  };

  const handleRemoveDomain = (index) => {
    setFormData((prev) => ({
      ...prev,
      domains: prev.domains.filter((_, i) => i !== index),
    }));
  };

  const handleDomainChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      domains: prev.domains.map((domain, i) =>
        i === index ? { ...domain, [field]: value } : domain
      ),
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        setMessage("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setMessage("Image size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, profilePicture: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        profilePicture: formData.profilePicture
          ? "/images/default-avatar.png"
          : "/images/default-avatar.png",
        domains: formData.domains,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("User added successfully!");
        setFormData({
          username: "",
          password: generatePassword(),
          profilePicture: null,
          domains: [],
        });
        if (onUserAdded) onUserAdded();
      } else {
        setMessage(result.error || "Error adding user");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Get available domains based on current user's permissions
  const getAvailableDomains = () => {
    if (!session?.user) return [];

    const userRole = session.user.currentDomain?.userRole;

    if (userRole === "superadmin") {
      // Superadmin can assign any domain
      return session.user.userDomains.map((ud) => ud.domain);
    } else if (userRole === "doc_admin") {
      // Doc admin can assign any domain with roles lower in hierarchy
      return session.user.userDomains.map((ud) => ud.domain);
    } else if (userRole === "site_admin") {
      // Site admin can only assign domains where they are site_admin
      return session.user.userDomains
        .filter((ud) => ud.userRole === "site_admin")
        .map((ud) => ud.domain);
    }

    return [];
  };

  const availableDomains = getAvailableDomains();

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2 style={{ marginBottom: "2rem", textAlign: "center" }}>
        Add New User
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "0.5rem",
          border: "1px solid #ddd",
        }}
      >
        {/* Username */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
            }}
          >
            Username:
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, username: e.target.value }))
            }
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "0.5rem",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
            }}
          >
            Password:
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
                fontSize: "1rem",
              }}
            />
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  password: generatePassword(),
                }))
              }
              style={{
                padding: "0.75rem 1rem",
                background: "#601f26",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Generate
            </button>
          </div>
        </div>

        {/* Profile Picture */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
            }}
          >
            Profile Picture:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "0.5rem",
            }}
          />
          {formData.profilePicture && (
            <div
              style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}
            >
              Selected: {formData.profilePicture.name}
            </div>
          )}
        </div>

        {/* Domains */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
            }}
          >
            Domain Assignments:
          </label>

          {formData.domains.map((domain, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1rem",
                alignItems: "center",
              }}
            >
              <select
                value={domain.domainId}
                onChange={(e) =>
                  handleDomainChange(index, "domainId", e.target.value)
                }
                required
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                }}
              >
                <option value="">Select Domain</option>
                {availableDomains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </select>

              <select
                value={domain.userRole}
                onChange={(e) =>
                  handleDomainChange(index, "userRole", e.target.value)
                }
                required
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                }}
              >
                <option value="editor">Editor</option>
                {session?.user?.currentDomain?.userRole === "doc_admin" ||
                session?.user?.currentDomain?.userRole === "superadmin" ? (
                  <>
                    <option value="site_admin">Site Admin</option>
                    <option value="doc_admin">Doc Admin</option>
                  </>
                ) : null}
                {session?.user?.currentDomain?.userRole === "superadmin" ? (
                  <option value="superadmin">Super Admin</option>
                ) : null}
              </select>

              <button
                type="button"
                onClick={() => handleRemoveDomain(index)}
                style={{
                  padding: "0.5rem",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                }}
              >
                <Remove />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddDomain}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: "transparent",
              color: "#6884f4",
              border: "1px dashed #6884f4",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
          >
            <Add /> Add Domain
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || formData.domains.length === 0}
          style={{
            width: "100%",
            padding: "1rem",
            background: "#601f26",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "1.1rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? "Adding User..." : "Add User"}
        </button>

        {/* Message */}
        {message && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: message.includes("success") ? "#d4edda" : "#f8d7da",
              color: message.includes("success") ? "#155724" : "#721c24",
              border: `1px solid ${
                message.includes("success") ? "#c3e6cb" : "#f5c6cb"
              }`,
              borderRadius: "0.25rem",
            }}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
