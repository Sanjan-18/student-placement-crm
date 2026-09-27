import Link from "next/link";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function statusClass(result: string | null) {
  const v = (result || "PENDING").toUpperCase();
  if (v === "PASS" || v === "PASSED") return "interview-status pass";
  if (v === "FAIL" || v === "FAILED") return "interview-status fail";
  if (v === "CANCELLED") return "interview-status cancelled";
  return "interview-status pending";
}

export default async function InterviewsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const interviews = await prisma.interview.findMany({
    include: { application: { include: { student: { include: { user: true } }, drive: { include: { company: true } } } } },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
  });

  const now = new Date();
  const upcoming = interviews.filter((i) => i.scheduledAt && new Date(i.scheduledAt) >= now && !["CANCELLED", "FAIL", "FAILED"].includes((i.result || "").toUpperCase()));
  const pending = interviews.filter((i) => !i.result || i.result.toUpperCase() === "PENDING");
  const completed = interviews.filter((i) => ["PASS", "PASSED", "FAIL", "FAILED"].includes((i.result || "").toUpperCase()));

  return (
    <WorkspaceShell role={session.user.role} active="interviews" global>
      <section className="legacy-page-content">
        <header className="topbar">
          <div><p className="eyebrow">PLACEMENT OPERATIONS</p><h1>Interviews</h1><p>Schedule, manage, and record every interview round.</p></div>
          <div className="topbar-actions">
            <Link className="secondary" href="/interviews/calendar">Schedule view</Link>
            {['ADMIN', 'PLACEMENT_OFFICER'].includes(session.user.role) && <Link className="primary" href="/interviews/new">+ Schedule Interview</Link>}
          </div>
        </header>

        <section className="stats interview-stats">
          <div className="stat-card"><span>Upcoming</span><strong>{upcoming.length}</strong><small>Scheduled rounds ahead</small></div>
          <div className="stat-card"><span>Pending result</span><strong>{pending.length}</strong><small>Rounds awaiting outcome</small></div>
          <div className="stat-card"><span>Completed</span><strong>{completed.length}</strong><small>Rounds with an outcome</small></div>
          <div className="stat-card"><span>Total rounds</span><strong>{interviews.length}</strong><small>Across all applications</small></div>
        </section>

        <section className="panel interview-table-panel">
          <div className="section-heading"><div><h2>Interview pipeline</h2><p>Open a round to review candidate context and update its result.</p></div><span className="section-count">{interviews.length}</span></div>
          {interviews.length === 0 ? <div className="empty interview-empty"><h3>No interviews yet</h3><p>Schedule the first interview for a shortlisted application.</p>{['ADMIN', 'PLACEMENT_OFFICER'].includes(session.user.role) && <Link className="primary" href="/interviews/new">Schedule interview</Link>}</div> : (
            <div className="interview-table-wrap">
              <div className="table-head interview-head"><span>Candidate</span><span>Company / Role</span><span>Round</span><span>Schedule</span><span>Mode</span><span>Result</span></div>
              {interviews.map((i) => <Link className="table-row interview-row refined-interview-row" href={`/interviews/${i.id}`} key={i.id}>
                <span><strong>{i.application.student.user.name || "Student"}</strong><small>{i.application.student.usn || i.application.student.user.email}</small></span>
                <span><strong>{i.application.drive.company.name}</strong><small>{i.application.drive.role}</small></span>
                <span><b>{i.round}</b></span>
                <span><strong>{i.scheduledAt ? new Date(i.scheduledAt).toLocaleDateString() : "Not scheduled"}</strong><small>{i.scheduledAt ? new Date(i.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Set a time"}</small></span>
                <span>{i.mode || "—"}</span>
                <span><b className={statusClass(i.result)}>{i.result || "PENDING"}</b></span>
              </Link>)}
            </div>
          )}
        </section>
      </section>
    </WorkspaceShell>
  );
}
