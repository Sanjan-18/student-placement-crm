import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ApplyButton from "./ApplyButton";
import DriveStatusControl from "@/components/workflow/DriveStatusControl";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import { auth } from "@/auth";

const date = (value: Date | null) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(value) : "Not specified";

export default async function DriveDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const d = await prisma.placementDrive.findUnique({ where: { id }, include: { company: true, _count: { select: { applications: true } } } });
  if (!d) notFound();
  const staff = ["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role);
  return <WorkspaceShell role={session.user.role} active="drives" global><section className="drive-detail-module">
    <div className="drive-detail-top"><div><Link className="back-link" href="/drives">← Placement Drives</Link><div className="drive-detail-title"><div className="company-icon company-icon-large">{d.company.name.charAt(0).toUpperCase()}</div><div><p className="eyebrow">PLACEMENT DRIVE</p><h1>{d.role}</h1><p>{d.company.name}{d.location ? ` · ${d.location}` : ""}</p></div></div></div><div className="drive-detail-actions">{staff && <Link className="secondary" href={`/drives/${d.id}/edit`}>Edit drive</Link>}<Link className="secondary" href={`/companies/${d.company.id}`}>View company</Link></div></div>
    <div className="drive-profile-summary"><div><span>Applications</span><strong>{d._count.applications}</strong></div><div><span>Status</span><strong>{d.status.replaceAll("_", " ")}</strong></div><div><span>Package</span><strong>{d.packageLpa ? `₹${d.packageLpa} LPA` : "—"}</strong></div><div><span>Deadline</span><strong>{d.applicationDeadline ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(d.applicationDeadline) : "—"}</strong></div></div>
    <div className="drive-detail-layout"><div className="drive-detail-main"><section className="panel drive-detail-card"><div className="section-heading"><div><h2>Drive details</h2><p>Core hiring information for this placement drive.</p></div><span className={`drive-status drive-status-${d.status.toLowerCase()}`}>{d.status.replaceAll("_", " ")}</span></div><div className="detail-grid">{[["Company", d.company.name], ["Role", d.role], ["Location", d.location], ["Package", d.packageLpa ? `₹${d.packageLpa} LPA` : null], ["Drive date", date(d.driveDate)], ["Application deadline", date(d.applicationDeadline)]].map(([l,v]) => <div className="detail-item" key={l}><span>{l}</span><strong>{v || "Not specified"}</strong></div>)}</div>{d.description && <div className="company-description"><span>Job description</span><p>{d.description}</p></div>}</section>
      <section className="panel drive-detail-card"><div className="section-heading"><div><h2>Eligibility criteria</h2><p>Rules used when a student applies.</p></div>{staff && <Link className="secondary" href={`/drives/${d.id}/eligibility`}>Eligible students</Link>}</div><div className="detail-grid">{[["Minimum CGPA", d.minCgpa], ["Departments", d.allowedDepartments], ["Graduation year", d.graduationYear], ["Maximum backlogs", d.maxBacklogs]].map(([l,v]) => <div className="detail-item" key={l}><span>{l}</span><strong>{v ?? "Any"}</strong></div>)}</div></section></div>
      <aside className="drive-detail-side"><section className="panel drive-detail-card"><h2>Drive controls</h2><p className="muted-copy">Update the hiring lifecycle without leaving the drive.</p>{staff ? <><label className="drive-status-control-label">Current status<DriveStatusControl id={d.id} current={d.status} /></label><Link className="secondary full-button" href={`/drives/${d.id}/eligibility`}>Review eligibility</Link></> : <div className="drive-student-note">Eligibility is checked automatically when you apply.</div>}</section>{session.user.role === "STUDENT" && <section className="panel drive-detail-card"><h2>Application</h2><p className="muted-copy">Apply only while the drive is active and before the deadline.</p><ApplyButton driveId={d.id}/></section>}</aside>
    </div>
  </section></WorkspaceShell>;
}
