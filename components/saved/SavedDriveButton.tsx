"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import ActionFeedback from "@/components/ui/ActionFeedback";
import { useState } from "react";

export default function SavedDriveButton({ driveId, initialSavedId = null }: { driveId: string; initialSavedId?: string | null }) {
  const [savedId, setSavedId] = useState(initialSavedId);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      if (!savedId) {
        const res = await fetch("/api/saved-drives", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ driveId }) });
        if (!res.ok) throw new Error("Could not save opportunity");
        const saved = await res.json();
        setSavedId(saved.id);
        setFeedback({ type: "success", message: "Saved" });
      } else {
        const res = await fetch(`/api/saved-drives/${savedId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Could not remove saved opportunity");
        setSavedId(null);
        setFeedback({ type: "success", message: "Removed" });
      }
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: "Could not update" });
    } finally {
      setBusy(false);
    }
  }

  const saved = Boolean(savedId);
  return (
    <div className="save-drive-action">
      <button type="button" className={`save-drive-button ${saved ? "saved" : ""}`} onClick={toggle} disabled={busy} aria-label={saved ? "Remove saved opportunity" : "Save opportunity"} title={saved ? "Remove from saved opportunities" : "Save opportunity"}>
        {saved ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>} {busy ? "Updating…" : saved ? "Saved" : "Save"}
      </button>
      {feedback && <ActionFeedback status={feedback.type} message={feedback.message} />}
    </div>
  );
}
