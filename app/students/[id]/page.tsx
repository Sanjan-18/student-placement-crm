import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import PlacementStatusControl from "@/components/workflow/PlacementStatusControl";

function date(value: Date | null | undefined) { return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value) : "—"; }
function statusClass(value: string) { return `student-status student-status-${value.toLowerCase()}`; }

export default async function StudentDetails({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/dashboard");
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      documents: { orderBy: { createdAt: "desc" }, take: 5 },
      applications: { include: { drive: { include: { company: true } }, interviews: { orderBy: { scheduledAt: "desc" }, take: 1 }, offer: true }, orderBy: { appliedAt: "desc" } },
    },
  });
  if (!student) notFound();

  const placed = student.placementStatus === "PLACED";
  const applicationCount = student.applications.length;
  const interviewCount = student.applications.reduce((sum, app) => sum + app.interviews.length, 0);
  const offerCount = student.applications.filter(app => app.offer).length;

  return (
    <section className="student-detail-page">
      <div className="student-detail-top"><div><Link className="back-link" href="/students">← All students</Link><div className="student-detail-title"><span className="student-avatar student-avatar-large">{(student.user.name || "S").slice(0,1).toUpperCase()}</span><div><p className="eyebrow">STUDENT PROFILE</p><h1>{student.user.name || "Unnamed student"}</h1><p>{student.user.email}</p></div></div></div><div className="student-detail-actions"><Link className="secondary" href={`/students/${student.id}/edit`}>Edit profile</Link><Link className="secondary" href="/students">Back</Link></div></div>

      <div className="student-profile-summary"><div><span>Placement status</span><strong className={statusClass(student.placementStatus)}>{student.placementStatus.replace("_", " ")}</strong></div><div><span>Department</span><strong>{student.department || "Not provided"}</strong></div><div><span>CGPA</span><strong>{student.cgpa ?? "—"}</strong></div><div><span>Graduation</span><strong>{student.graduationYear ?? "—"}</strong></div></div>

      <div className="student-detail-layout">
        <div className="student-detail-main">
          <section className="panel student-detail-card"><div className="section-heading"><div><h2>Profile information</h2><p>Academic and contact details used for placement operations.</p></div><PlacementStatusControl id={student.id} current={student.placementStatus} canManage={true} /></div><div className="detail-grid">
            {[['Email', student.user.email],['Phone', student.phone],['USN', student.usn],['Department', student.department],['Graduation year', student.graduationYear],['CGPA', student.cgpa],['10th percentage', student.tenthPercentage],['12th percentage', student.twelfthPercentage],['Backlogs', student.backlogs],['Profile updated', date(student.updatedAt)]].map(([label,value]) => <div className="detail-item" key={label as string}><span>{label}</span><strong>{value === null || value === undefined || value === "" ? "Not provided" : String(value)}</strong></div>)}
          </div></section>

          <section className="panel student-detail-card"><div className="section-heading"><div><h2>Application history</h2><p>{applicationCount} application{applicationCount === 1 ? "" : "s"} linked to this profile.</p></div></div>{student.applications.length === 0 ? <div className="student-empty compact"><h3>No applications yet</h3><p>Applications will appear here when the student applies to a placement drive.</p></div> : <div className="application-history">{student.applications.map(app => <div className="application-history-row" key={app.id}><div><strong>{app.drive.company.name}</strong><span>{app.drive.role}</span><small>Applied {date(app.appliedAt)}{app.interviews[0]?.scheduledAt ? ` · Interview ${date(app.interviews[0].scheduledAt)}` : ""}</small></div><div className="application-history-meta"><b className={statusClass(app.status)}>{app.status.replace("_", " ")}</b>{app.offer && <span className="offer-chip">Offer</span>}</div></div>)}</div>}</section>
        </div>
        <aside className="student-detail-side">
          <section className="panel student-detail-card"><h2>Placement snapshot</h2><div className="snapshot-list"><div><span>Applications</span><strong>{applicationCount}</strong></div><div><span>Interviews</span><strong>{interviewCount}</strong></div><div><span>Offers</span><strong>{offerCount}</strong></div><div><span>Backlogs</span><strong>{student.backlogs}</strong></div></div></section>
          <section className="panel student-detail-card"><h2>Resume</h2>{student.resumeUrl ? <><p className="muted-copy">Current resume link is available.</p><a className="secondary full-button" href={student.resumeUrl} target="_blank" rel="noreferrer">Open resume ↗</a></> : <><p className="muted-copy">No resume has been added to this profile.</p><Link className="secondary full-button" href={`/students/${student.id}/edit`}>Add resume link</Link></>}</section>
          <section className="panel student-detail-card"><h2>Documents</h2>{student.documents.length === 0 ? <p className="muted-copy">No documents recorded.</p> : <div className="mini-list">{student.documents.map(doc => <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer"><span>{doc.name}</span><small>{doc.type}</small></a>)}</div>}</section>
        </aside>
      </div>
    </section>
  );
}
