"use client";

import { useEffect, useState } from "react";
import { Bell, Send, UserRound } from "lucide-react";

export default function PushTestForm() {
  const [users, setUsers] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("Placement CRM Test");
  const [message, setMessage] = useState("Your push notification setup is working.");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/notifications/recipients")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => setUsers([]));
  }, []);

  async function sendPush(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, message, type: "SYSTEM" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to send notification");
      setStatus(data.push?.sent ? "Push notification sent successfully." : "Notification created, but no active push token was available.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send notification");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="push-test-form" onSubmit={sendPush}>
      <div className="push-recipient-card">
        <div className="push-icon"><UserRound size={20} /></div>
        <div><strong>Choose a recipient</strong><span>Select a user with a registered browser device.</span></div>
      </div>
      <label>Recipient
        <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
          <option value="">Select user</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name || u.email} — {u._count.fcmTokens} device{u._count.fcmTokens === 1 ? "" : "s"}</option>)}
        </select>
      </label>
      <label>Notification title
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required />
      </label>
      <label>Message
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={240} required />
      </label>
      {status && <div className="form-message success">{status}</div>}
      <button className="primary push-send-btn" disabled={loading || !userId} type="submit">
        <Send size={17} /> {loading ? "Sending..." : "Send Push Notification"}
      </button>
    </form>
  );
}
