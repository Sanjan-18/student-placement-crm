"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      className="google-btn"
      type="button"
      onClick={handleSignIn}
      disabled={loading}
      aria-busy={loading}
    >
      <span aria-hidden="true">G</span>
      {loading ? "Connecting to Google…" : "Continue with Google"}
    </button>
  );
}
