import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BellRing, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import PushTestForm from "@/components/notifications/PushTestForm";

export default async function SendNotificationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/notifications");

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand"><div className="logo small">P</div><b>PlacementCRM</b></div>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav>
          <Link className="nav-item" href="/dashboard">Dashboard</Link>
          <Link className="nav-item" href="/students">Students</Link>
          <Link className="nav-item" href="/companies">Companies</Link>
          <Link className="nav-item" href="/drives">Placement Drives</Link>
          <Link className="nav-item" href="/applications">Applications</Link>
          <Link className="nav-item active" href="/notifications">Notifications</Link>
          <Link className="nav-item" href="/analytics">Analytics</Link>
        </nav>
        <div className="sidebar-bottom"><span className="role-pill">{session.user.role.replace("_", " ")}</span><small>Placement operations workspace</small></div>
      </aside>
      <section className="content">
        
        <header className="topbar page-topbar">
          <div><p className="eyebrow">NOTIFICATION CENTER</p><h1>Send push notification</h1><p>Deliver a real-time Firebase notification to a registered browser.</p></div>
          <Link href="/notifications" className="secondary topbar-action"><ArrowLeft size={16} /> Back to inbox</Link>
        </header>
        <div className="notification-hero">
          <div className="notification-hero-icon"><BellRing size={25} /></div>
          <div><strong>FCM delivery test</strong><span>Use this screen to verify your browser token, Firebase Admin credentials and push delivery end-to-end.</span></div>
          <div className="notification-secure"><ShieldCheck size={16} /> Staff only</div>
        </div>
        <div className="content-two-column">
          <section className="panel form-panel"><div className="section-heading"><div><p className="eyebrow">PUSH</p><h2>Compose notification</h2></div></div><PushTestForm /></section>
          <aside className="panel notification-info"><p className="eyebrow">HOW IT WORKS</p><h2>Delivery flow</h2><ol><li><b>Browser token</b><span>Chrome registers the device with FCM.</span></li><li><b>CRM database</b><span>The token is stored in the FcmToken table.</span></li><li><b>Firebase Admin</b><span>The server sends the message to the selected token.</span></li><li><b>Browser notification</b><span>Chrome displays the push notification.</span></li></ol></aside>
        </div>
      </section>
    </main>
  );
}
