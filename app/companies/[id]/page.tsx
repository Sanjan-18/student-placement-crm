import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const date = (value: Date | null) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value) : "—";

export default async function CompanyDetails({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/dashboard");
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id }, include: {
    _count: { select: { drives: true, crmActivities: true } },
    drives: { orderBy: [{ createdAt: "desc" }], take: 8, include: { _count: { select: { applications: true } } } },
    crmActivities: { orderBy: { createdAt: "desc" }, take: 5 },
  }});
  if (!company) notFound();

  const active = company.drives.filter(d => d.status === "ACTIVE").length;
  const offered = company.drives.reduce((sum, d) => sum + d._count.applications, 0);

  return <section className="company-detail-module">
    <div className="company-detail-top"><div><Link className="back-link" href="/companies">← Companies</Link><div className="company-detail-title"><div className="company-icon company-icon-large">{company.name.slice(0, 1).toUpperCase()}</div><div><p className="eyebrow">COMPANY PROFILE</p><h1>{company.name}</h1><p>{company.industry || "Recruiting partner"}{company.location ? ` · ${company.location}` : ""}</p></div></div></div><div className="company-detail-actions"><Link className="secondary" href={`/companies/${company.id}/edit`}>Edit company</Link><Link className="primary" href={`/drives/new?companyId=${company.id}`}>+ Add drive</Link></div></div>

    <div className="company-profile-summary">
      <div><span>Total drives</span><strong>{company._count.drives}</strong></div><div><span>Active drives</span><strong>{active}</strong></div><div><span>Applications</span><strong>{offered}</strong></div><div><span>CRM activities</span><strong>{company._count.crmActivities}</strong></div>
    </div>

    <div className="company-detail-layout">
      <div className="company-detail-main">
        <section className="panel company-detail-card"><div className="section-heading"><div><h2>Company information</h2><p>Core details used across placement operations.</p></div><span className="company-status-dot">PROFILE</span></div><div className="detail-grid">
          {[['Industry', company.industry], ['Website', company.website], ['Location', company.location], ['Recruiter', company.recruiter], ['Recruiter email', company.recruiterEmail], ['Created', date(company.createdAt)]].map(([label, value]) => <div className="detail-item" key={label}><span>{label}</span><strong>{value || "Not provided"}</strong></div>)}
        </div>{company.description && <div className="company-description"><span>Description</span><p>{company.description}</p></div>}</section>

        <section className="panel company-detail-card"><div className="section-heading"><div><h2>Placement drives</h2><p>Recent hiring drives linked to this company.</p></div><Link className="secondary" href={`/drives?company=${company.id}`}>View all</Link></div>
          {company.drives.length === 0 ? <div className="company-empty compact"><h3>No drives yet</h3><p>Create a placement drive to start tracking hiring activity.</p><Link className="secondary" href={`/drives/new?companyId=${company.id}`}>Create drive</Link></div> : <div className="company-drive-list">{company.drives.map(d => <Link className="company-drive-row" href={`/drives/${d.id}`} key={d.id}><div><strong>{d.role}</strong><span>{d.location || "Location not set"} · {d.packageLpa ? `₹${d.packageLpa} LPA` : "Package not set"}</span><small>{d.applicationDeadline ? `Deadline ${date(d.applicationDeadline)}` : "No application deadline"}</small></div><div><b className={`drive-status drive-status-${d.status.toLowerCase()}`}>{d.status.replaceAll("_", " ")}</b><span>{d._count.applications} applications</span></div></Link>)}</div>}
        </section>
      </div>
      <aside className="company-detail-side">
        <section className="panel company-detail-card"><h2>Recruiter contact</h2><p className="muted-copy">Primary point of contact for placement coordination.</p>{company.recruiter ? <><div className="contact-card"><div className="contact-avatar">{company.recruiter.slice(0,1).toUpperCase()}</div><div><strong>{company.recruiter}</strong><span>{company.recruiterEmail || "Email not provided"}</span></div></div>{company.recruiterEmail && <a className="secondary full-button" href={`mailto:${company.recruiterEmail}`}>Email recruiter</a>}</> : <div className="company-empty compact"><h3>No recruiter assigned</h3><p>Add recruiter details from Edit company.</p></div>}</section>
        <section className="panel company-detail-card"><h2>Recent activity</h2><p className="muted-copy">Latest CRM activity for this company.</p>{company.crmActivities.length === 0 ? <div className="company-empty compact"><p>No activity recorded yet.</p></div> : <div className="activity-mini-list">{company.crmActivities.map(a => <div key={a.id}><strong>{a.type.replaceAll("_", " ")}</strong><span>{a.subject || a.notes || "Activity recorded"}</span><small>{date(a.createdAt)}</small></div>)}</div>}</section>
      </aside>
    </div>
  </section>;
}
