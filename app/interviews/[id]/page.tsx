import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import InterviewResultControl from "@/components/interviews/InterviewResultControl";

export default async function InterviewDetails({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return null;
  const { id } = await params;
  const i = await prisma.interview.findUnique({ where: { id }, include: { application: { include: { student: { include: { user: true } }, drive: { include: { company: true } } } } } });
  if (!i) notFound();
  if (session.user.role === "STUDENT" && i.application.student.userId !== session.user.id) notFound();

  const canManage = ["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role);
  const isPast = !!i.scheduledAt && new Date(i.scheduledAt) < new Date();

  return (
    <WorkspaceShell role={session.user.role} active="interviews" global>
      <section className="legacy-page-content">
        <header className="topbar">
          <div><p className="eyebrow">INTERVIEW ROUND</p><h1>{i.round}</h1><p>{i.application.drive.company.name} · {i.application.drive.role}</p></div>
          <Link className="secondary" href="/interviews">← All interviews</Link>
        </header>

        <section className="interview-detail-hero panel">
          <div className="interview-company-mark">{i.application.drive.company.name.slice(0, 1).toUpperCase()}</div>
          <div className="interview-hero-copy"><span>{i.application.drive.company.name}</span><h2>{i.application.drive.role}</h2><p>{i.round} round · {i.mode || "Mode not set"}</p></div>
          <div className="interview-hero-status"><span>Result</span><strong className={`interview-status ${(i.result || "PENDING").toLowerCase()}`}>{i.result || "PENDING"}</strong></div>
        </section>

        <div className="interview-detail-grid">
          <section className="panel">
            <div className="section-title"><div><h2>Round details</h2><p>Schedule and outcome for this interview.</p></div></div>
            <div className="detail-list">
              <div className="detail-list-row"><div><strong>Candidate</strong><span>Student</span></div><b>{i.application.student.user.name || i.application.student.user.email}</b></div>
              <div className="detail-list-row"><div><strong>Scheduled</strong><span>Date and time</span></div><b>{i.scheduledAt ? new Date(i.scheduledAt).toLocaleString() : "Not scheduled"}</b></div>
              <div className="detail-list-row"><div><strong>Mode</strong><span>Interview format</span></div><b>{i.mode || "Not set"}</b></div>
              <div className="detail-list-row"><div><strong>Status</strong><span>Current result</span></div><b>{i.result || "PENDING"}</b></div>
            </div>
            {i.meetingLink && <a className="primary inline-btn" href={i.meetingLink} target="_blank" rel="noreferrer">Join meeting ↗</a>}
            {canManage && <div className="interview-result-editor"><InterviewResultControl id={i.id} current={i.result || "PENDING"} /></div>}
          </section>

          <section className="panel">
            <div className="section-title"><div><h2>Candidate context</h2><p>Application information for this round.</p></div></div>
            <div className="candidate-context-card"><div className="candidate-avatar">{(i.application.student.user.name || "S").slice(0, 1).toUpperCase()}</div><div><strong>{i.application.student.user.name || "Student"}</strong><span>{i.application.student.usn || "USN not available"}</span><span>{i.application.student.user.email}</span></div></div>
            <div className="detail-list">
              <div className="detail-list-row"><div><strong>Application status</strong><span>Current pipeline stage</span></div><b>{i.application.status}</b></div>
              <div className="detail-list-row"><div><strong>Applied</strong><span>Application date</span></div><b>{new Date(i.application.appliedAt).toLocaleDateString()}</b></div>
            </div>
            {isPast && !i.result && <div className="interview-note">This round is past its scheduled time. Record the result when it is available.</div>}
          </section>
        </div>
      </section>
    </WorkspaceShell>
  );
}
