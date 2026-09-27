import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, FileText, Gift, XCircle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import WorkspaceShell from "@/components/layout/WorkspaceShell";

const stages = ["APPLIED", "SHORTLISTED", "APTITUDE", "TECHNICAL", "HR", "SELECTED", "OFFERED", "ACCEPTED"];

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(value: Date | null | undefined) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(value);
}

function stageIndex(status: string) {
  const index = stages.indexOf(status);
  return index < 0 ? 0 : index;
}

export default async function MyApplicationsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) redirect("/profile");

  const applications = await prisma.application.findMany({
    where: { studentId: user.student.id },
    include: {
      drive: { include: { company: true } },
      interviews: { orderBy: { scheduledAt: "asc" } },
      offer: true,
    },
    orderBy: { appliedAt: "desc" },
  });

  const active = applications.filter(a => !["REJECTED", "WITHDRAWN", "ACCEPTED"].includes(a.status)).length;
  const interviewCount = applications.reduce((sum, a) => sum + a.interviews.length, 0);
  const offers = applications.filter(a => Boolean(a.offer)).length;
  const accepted = applications.filter(a => a.status === "ACCEPTED").length;

  return <WorkspaceShell role={"STUDENT"} active="my-applications" notificationCount={0}>

      <header className="topbar page-topbar">
        <div><p className="eyebrow">APPLICATION TRACKER</p><h1>My applications</h1><p>Follow every placement application from submission through interviews and offer.</p></div>
        <Link className="primary" href="/opportunities">Find opportunities <ArrowUpRight size={15}/></Link>
      </header>

      <div className="stats dashboard-kpis">
        <div className="stat stat-accent"><div className="stat-icon"><FileText size={18}/></div><span>Total applications</span><strong>{applications.length}</strong><small>All placement applications</small></div>
        <div className="stat"><div className="stat-icon"><Clock3 size={18}/></div><span>Active applications</span><strong>{active}</strong><small>Still moving through stages</small></div>
        <div className="stat"><div className="stat-icon"><CalendarDays size={18}/></div><span>Interview rounds</span><strong>{interviewCount}</strong><small>Scheduled or completed</small></div>
        <div className="stat"><div className="stat-icon"><Gift size={18}/></div><span>Offers</span><strong>{offers}</strong><small>{accepted ? `${accepted} accepted` : "No accepted offers yet"}</small></div>
      </div>

      {!applications.length ? <div className="panel tracker-empty"><div className="empty-icon"><BriefcaseBusiness size={20}/></div><h2>No applications yet</h2><p>Explore active placement drives and apply to opportunities that match your profile.</p><Link className="primary" href="/opportunities">Explore opportunities</Link></div> :
        <div className="application-tracker-list">
          {applications.map(application => {
            const current = stageIndex(application.status);
            const latestInterview = application.interviews[application.interviews.length - 1];
            return <article className="panel tracker-card" key={application.id}>
              <div className="tracker-card-head">
                <div className="tracker-company"><div className="company-avatar">{application.drive.company.name.charAt(0).toUpperCase()}</div><div><h2>{application.drive.role}</h2><p>{application.drive.company.name} · {application.drive.location || "Location not specified"}</p></div></div>
                <span className={`status-badge status-${application.status.toLowerCase()}`}>{label(application.status)}</span>
              </div>

              <div className="tracker-meta"><span>Applied {formatDate(application.appliedAt)}</span>{application.drive.packageLpa && <span>₹{application.drive.packageLpa} LPA</span>}{application.drive.applicationDeadline && <span>Deadline {formatDate(application.drive.applicationDeadline)}</span>}</div>

              <div className="tracker-progress" aria-label={`Application stage: ${label(application.status)}`}>
                {stages.map((stage, index) => <div className={`tracker-stage ${index <= current ? "done" : ""} ${stage === application.status ? "current" : ""}`} key={stage}><span className="tracker-stage-dot">{index < current ? <CheckCircle2 size={12}/> : index === current ? <span/> : null}</span><small>{label(stage)}</small></div>)}
              </div>

              <div className="tracker-footer">
                <div className="tracker-highlight">
                  {application.offer ? <><Gift size={16}/><span><b>Offer {label(application.offer.status)}</b><small>{application.offer.packageLpa ? `₹${application.offer.packageLpa} LPA` : "Package not set"}{application.offer.joiningDate ? ` · Joining ${formatDate(application.offer.joiningDate)}` : ""}</small></span></> : latestInterview ? <><CalendarDays size={16}/><span><b>{latestInterview.round} interview</b><small>{formatDate(latestInterview.scheduledAt)} · {latestInterview.result || "Result pending"}</small></span></> : application.status === "REJECTED" ? <><XCircle size={16}/><span><b>Application closed</b><small>This application was not progressed further.</small></span></> : <><Clock3 size={16}/><span><b>Waiting for next stage</b><small>Watch notifications for placement updates.</small></span></>}
                </div>
                <Link className="secondary" href={`/applications/${application.id}`}>View details <ArrowUpRight size={14}/></Link>
              </div>
            </article>;
          })}
        </div>}
</WorkspaceShell>;
}
