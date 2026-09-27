import Link from "next/link";
import { Bell, Send } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import NotificationInbox from "@/components/notifications/NotificationInbox";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const notifications = user ? await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }) : [];
  const serialized = notifications.map((notification) => ({ id: notification.id, title: notification.title, message: notification.message, type: notification.type ?? "GENERAL", isRead: notification.isRead, createdAt: notification.createdAt.toISOString() }));
  const unread = notifications.filter((notification) => !notification.isRead).length;
  const isStaff = ["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role);

  return (
    <WorkspaceShell role={session.user.role} active="notifications" notificationCount={unread}>

        <header className="topbar page-topbar">
          <div><p className="eyebrow">ACTIVITY CENTER</p><h1>Notifications</h1><p>Stay on top of applications, interviews, offers and placement updates.</p></div>
          {isStaff && <Link className="primary topbar-action" href="/notifications/send"><Send size={16} /> Send notification</Link>}
        </header>
        <div className="notification-summary">
          <div className="panel summary-mini"><div className="summary-mini-icon"><Bell size={18} /></div><div><span>Total inbox</span><strong>{notifications.length}</strong></div></div>
          <div className="panel summary-mini"><div className="summary-mini-icon unread-icon"><Bell size={18} /></div><div><span>Unread</span><strong>{unread}</strong></div></div>
          <div className="panel summary-mini notification-status-card"><div><span>Delivery</span><strong>FCM enabled</strong></div><small>Browser push is connected to your account.</small></div>
        </div>
        <NotificationInbox initialNotifications={serialized} />
    </WorkspaceShell>
  );
}
