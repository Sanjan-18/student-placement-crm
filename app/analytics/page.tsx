import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WorkspaceShell from "@/components/layout/WorkspaceShell";

const funnelOrder = ["APPLIED", "SHORTLISTED", "APTITUDE", "TECHNICAL", "HR", "SELECTED", "OFFERED", "ACCEPTED"] as const;

function pct(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/dashboard");

  const [students, companies, drives, applications, offers, placed, interviews, status, departments, packages] = await Promise.all([
    prisma.student.count(),
    prisma.company.count(),
    prisma.placementDrive.count(),
    prisma.application.count(),
    prisma.offer.count(),
    prisma.student.count({ where: { placementStatus: "PLACED" } }),
    prisma.interview.count(),
    prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.student.groupBy({ by: ["department"], _count: { _all: true }, orderBy: { _count: { department: "desc" } } }),
    prisma.offer.findMany({ select: { packageLpa: true }, where: { packageLpa: { not: null } } }),
  ]);

  const countFor = (key: string) => status.find((item) => item.status === key)?._count._all ?? 0;
  const accepted = countFor("ACCEPTED");
  const offered = countFor("OFFERED");
  const values = packages.map((item) => item.packageLpa ?? 0).filter((value) => value > 0);
  const averagePackage = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const highestPackage = values.length ? Math.max(...values) : 0;
  const funnel = funnelOrder.map((stage) => ({ stage, count: countFor(stage) }));
  const maxFunnel = Math.max(1, ...funnel.map((item) => item.count));

  return (
    <WorkspaceShell role={session.user.role} active="analytics" global>
      <header className="page-topbar analytics-page-header">
        <div>
          <p className="eyebrow">PLACEMENT INSIGHTS</p>
          <h1>Placement Analytics</h1>
          <p className="muted">A clear operational view of students, hiring activity, applications and outcomes.</p>
        </div>
        <div className="topbar-actions">
          <Link className="secondary" href="/analytics/placement-trends">Detailed trends</Link>
          <Link className="primary" href="/analytics/advanced">Advanced analytics</Link>
        </div>
      </header>

      <section className="analytics-kpi-grid" aria-label="Placement summary">
        <div className="stat-card analytics-kpi"><span>Students</span><strong>{students}</strong><small>Total registered students</small></div>
        <div className="stat-card analytics-kpi"><span>Placed</span><strong>{placed}</strong><small>{pct(placed, students)}% of students</small></div>
        <div className="stat-card analytics-kpi"><span>Applications</span><strong>{applications}</strong><small>{applications && students ? (applications / students).toFixed(1) : "0.0"} per student</small></div>
        <div className="stat-card analytics-kpi"><span>Offers</span><strong>{offers}</strong><small>{pct(offers, applications)}% of applications</small></div>
        <div className="stat-card analytics-kpi"><span>Interviews</span><strong>{interviews}</strong><small>Interview records</small></div>
        <div className="stat-card analytics-kpi"><span>Companies</span><strong>{companies}</strong><small>Recruiting organizations</small></div>
        <div className="stat-card analytics-kpi"><span>Active / total drives</span><strong>{drives}</strong><small>Placement drive records</small></div>
        <div className="stat-card analytics-kpi"><span>Accepted offers</span><strong>{accepted}</strong><small>{pct(accepted, offers)}% of offers</small></div>
      </section>

      <section className="analytics-main-grid">
        <article className="panel analytics-panel">
          <div className="section-heading"><div><h2>Application funnel</h2><p>Current application records by stage.</p></div><span className="analytics-total">{applications} total</span></div>
          <div className="analytics-funnel">
            {funnel.map((item) => (
              <div className="analytics-funnel-row" key={item.stage}>
                <div className="analytics-funnel-label"><span>{item.stage}</span><b>{item.count}</b></div>
                <div className="analytics-track"><i style={{ width: `${Math.max(item.count ? 5 : 0, (item.count / maxFunnel) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel analytics-panel">
          <div className="section-heading"><div><h2>Placement outcome</h2><p>Key conversion points from the current dataset.</p></div></div>
          <div className="analytics-outcome-list">
            <div><span>Students placed</span><strong>{pct(placed, students)}%</strong><small>{placed} of {students}</small></div>
            <div><span>Applications → offers</span><strong>{pct(offers, applications)}%</strong><small>{offers} of {applications}</small></div>
            <div><span>Offers → accepted</span><strong>{pct(accepted, offers)}%</strong><small>{accepted} of {offers}</small></div>
            <div><span>Selected / offered</span><strong>{pct(countFor("SELECTED"), Math.max(1, applications))}%</strong><small>{countFor("SELECTED")} selected</small></div>
          </div>
        </article>
      </section>

      <section className="analytics-secondary-grid">
        <article className="panel analytics-panel">
          <div className="section-heading"><div><h2>Students by department</h2><p>Distribution of the current student population.</p></div></div>
          {departments.length ? (
            <div className="analytics-department-list">
              {departments.map((item) => {
                const count = item._count._all;
                return <div className="analytics-department-row" key={item.department ?? "unknown"}><span>{item.department || "Not set"}</span><div className="analytics-track"><i style={{ width: `${pct(count, Math.max(1, students))}%` }} /></div><b>{count}</b></div>;
              })}
            </div>
          ) : <div className="empty"><h3>No department data</h3><p>Student department information will appear here once records are available.</p></div>}
        </article>

        <article className="panel analytics-panel">
          <div className="section-heading"><div><h2>Package overview</h2><p>Based on offers with a recorded package.</p></div></div>
          <div className="analytics-package-grid">
            <div><span>Average package</span><strong>{averagePackage ? `₹${averagePackage.toFixed(2)} LPA` : "—"}</strong></div>
            <div><span>Highest package</span><strong>{highestPackage ? `₹${highestPackage.toFixed(2)} LPA` : "—"}</strong></div>
            <div><span>Recorded packages</span><strong>{values.length}</strong></div>
            <div><span>Offers accepted</span><strong>{accepted}</strong></div>
          </div>
          <div className="analytics-note"><span>Offers awaiting acceptance</span><b>{Math.max(0, offered - accepted)}</b></div>
        </article>
      </section>
    </WorkspaceShell>
  );
}
