import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminControlCenter() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [users, students, companies, drives, applications, interviews, offers, notifications, activeDrives, placedStudents] = await Promise.all([
    prisma.user.count(),
    prisma.student.count(),
    prisma.company.count(),
    prisma.placementDrive.count(),
    prisma.application.count(),
    prisma.interview.count(),
    prisma.offer.count(),
    prisma.notification.count(),
    prisma.placementDrive.count({ where: { status: "ACTIVE" } }),
    prisma.student.count({ where: { placementStatus: "PLACED" } }),
  ]);

  const placementRate = students ? Math.round((placedStudents / students) * 100) : 0;

  return (
    <main className="content admin-center">
      <div className="topbar admin-center-header">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Control Center</h1>
          <p className="muted">A focused overview of users, placement activity and operational health.</p>
        </div>
        <div className="topbar-actions">
          <Link className="primary" href="/admin/users">Manage Users</Link>
          <Link className="secondary" href="/analytics">View Analytics</Link>
        </div>
      </div>

      <section className="admin-kpis" aria-label="System overview">
        <K title="Users" value={users} />
        <K title="Students" value={students} />
        <K title="Companies" value={companies} />
        <K title="Active drives" value={activeDrives} />
        <K title="Applications" value={applications} />
        <K title="Interviews" value={interviews} />
        <K title="Offers" value={offers} />
        <K title="Notifications" value={notifications} />
      </section>

      <div className="admin-control-grid">
        <section className="panel admin-placement-card">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">PLACEMENT HEALTH</p>
              <h2>Current overview</h2>
            </div>
            <span className="status-badge active">Live data</span>
          </div>
          <div className="admin-health">
            <Metric label="Active drives" value={activeDrives} />
            <Metric label="Placed students" value={placedStudents} />
            <Metric label="Placement rate" value={`${placementRate}%`} />
          </div>
          <div className="admin-progress" aria-label={`Placement rate ${placementRate}%`}>
            <div className="admin-progress-bar" style={{ width: `${Math.min(placementRate, 100)}%` }} />
          </div>
          <p className="muted admin-note">Placement rate is calculated from students currently marked as placed.</p>
        </section>

        <section className="panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">QUICK ACCESS</p>
              <h2>Administration</h2>
            </div>
          </div>
          <div className="admin-links">
            <Link href="/admin/users"><strong>User & role management</strong><span>Manage access and account roles</span><b>→</b></Link>
            <Link href="/analytics"><strong>Placement analytics</strong><span>Review placement performance</span><b>→</b></Link>
            <Link href="/reports"><strong>Reports</strong><span>Open existing placement reports</span><b>→</b></Link>
            <Link href="/admin/audit"><strong>Audit activity</strong><span>Review administrative activity</span><b>→</b></Link>
          </div>
        </section>
      </div>

      <section className="panel admin-system-summary">
        <div>
          <p className="eyebrow">SYSTEM SUMMARY</p>
          <h2>Placement CRM at a glance</h2>
          <p className="muted">Use the focused admin workspace for access management and oversight. Operational work remains in the main CRM modules.</p>
        </div>
        <div className="admin-summary-stats">
          <Summary label="Drives" value={drives} />
          <Summary label="Students" value={students} />
          <Summary label="Companies" value={companies} />
          <Summary label="Offers" value={offers} />
        </div>
      </section>
    </main>
  );
}

function K({ title, value }: { title: string; value: number }) {
  return <div className="panel admin-kpi"><span>{title}</span><strong>{value}</strong></div>;
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <div><span>{label}</span><b>{value}</b></div>;
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
