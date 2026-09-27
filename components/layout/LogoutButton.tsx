"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <button
      type="button"
      className="sidebar-logout"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Log out and return to login"
    >
      <LogOut size={15} strokeWidth={1.9} />
      <span>{loading ? "Logging out…" : "Logout"}</span>
    </button>
  );
}
