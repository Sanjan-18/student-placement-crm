"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Loader2, Search, X } from "lucide-react";
import ActionFeedback from "@/components/ui/ActionFeedback";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationInbox({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const unreadCount = items.filter((item) => !item.isRead).length;
  const types = useMemo(() => Array.from(new Set(items.map((item) => item.type))).sort(), [items]);
  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesRead = filter === "ALL" || !item.isRead;
      const matchesType = typeFilter === "ALL" || item.type === typeFilter;
      const matchesQuery = !normalized || [item.title, item.message, item.type].some((value) => value.toLowerCase().includes(normalized));
      return matchesRead && matchesType && matchesQuery;
    });
  }, [filter, items, query, typeFilter]);

  async function markRead(id: string) {
    setBusy(id);
    setFeedback(null);
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!response.ok) throw new Error("Unable to update notification");
      setItems((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
      setFeedback({ type: "success", message: "Notification marked as read" });
    } catch (error) { console.error(error); setFeedback({ type: "error", message: "Could not update notification" }); } finally { setBusy(null); }
  }

  async function markAllRead() {
    if (!unreadCount) return;
    setBusy("all");
    setFeedback(null);
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) });
      if (!response.ok) throw new Error("Unable to update notifications");
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      setFeedback({ type: "success", message: "All notifications marked as read" });
    } catch (error) { console.error(error); setFeedback({ type: "error", message: "Could not update notifications" }); } finally { setBusy(null); }
  }

  return (
    <div className="notification-inbox">
      <div className="notification-toolbar notification-toolbar-refined">
        <div className="notification-filters">
          <label className="notification-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notifications" aria-label="Search notifications" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear notification search"><X size={14} /></button>}</label>
          <button className={filter === "ALL" ? "filter-pill active" : "filter-pill"} onClick={() => setFilter("ALL")} type="button">All <span>{items.length}</span></button>
          <button className={filter === "UNREAD" ? "filter-pill active" : "filter-pill"} onClick={() => setFilter("UNREAD")} type="button">Unread <span>{unreadCount}</span></button>
          <select className="notification-type-filter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter notification type">
            <option value="ALL">All types</option>
            {types.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        <button className="secondary notification-mark-all" disabled={!unreadCount || busy === "all"} onClick={markAllRead} type="button">
          {busy === "all" ? <Loader2 size={15} className="spin" /> : <CheckCheck size={15} />} Mark all read
        </button>
        {feedback && <ActionFeedback status={feedback.type} message={feedback.message} />}
      </div>
      <div className="notification-list">
        {!visibleItems.length ? (
          <div className="panel empty notification-empty">
            <div className="empty-icon"><Bell size={22} /></div>
            <strong>{query || typeFilter !== "ALL" ? "No matching notifications" : filter === "UNREAD" ? "You're all caught up" : "No notifications yet"}</strong>
            <p>{query || typeFilter !== "ALL" ? "Try a different search term or notification type." : filter === "UNREAD" ? "There are no unread placement updates." : "Application, interview and offer updates will appear here."}</p>
          </div>
        ) : visibleItems.map((notification) => (
          <article className={`panel notification-item ${notification.isRead ? "read" : "unread"}`} key={notification.id}>
            <div className="notification-item-icon"><Bell size={17} /></div>
            <div className="notification-item-body">
              <div className="notification-item-top">
                <div><strong>{notification.title}</strong><span className="notification-type">{notification.type.replaceAll("_", " ")}</span></div>
                <small>{mounted ? new Date(notification.createdAt).toLocaleString() : ""}</small>
              </div>
              <p>{notification.message}</p>
              {!notification.isRead && <button className="text-action" disabled={busy === notification.id} onClick={() => markRead(notification.id)} type="button">{busy === notification.id ? "Updating..." : "Mark as read"}</button>}
            </div>
            {!notification.isRead && <span className="notification-dot" aria-label="Unread" />}
          </article>
        ))}
      </div>
    </div>
  );
}
