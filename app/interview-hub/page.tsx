import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, ExternalLink, Video, XCircle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import WorkspaceShell from "@/components/layout/WorkspaceShell";

function label(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
function formatDate(value: Date | null) { if (!value) return "Not scheduled"; return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(value); }

export default async function InterviewHubPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) redirect("/profile");
  const now = new Date();
  const interviews = await prisma.interview.findMany({ where: { application: { studentId: user.student.id } }, include: { application: { include: { drive: { include: { company: true } } } } }, orderBy: { scheduledAt: "asc" } });
  const upcoming = interviews.filter(i => i.scheduledAt && i.scheduledAt >= now && i.result !== "CANCELLED");
  const completed = interviews.filter(i => !upcoming.some(u => u.id === i.id));
  const next = upcoming[0];
  const pending = interviews.filter(i => !i.result || i.result === "PENDING").length;
  const passed = interviews.filter(i => ["PASS", "PASSED"].includes(i.result || "")).length;

  return <WorkspaceShell role={"STUDENT"} active="interview-hub" notificationCount={0}>
<header className="topbar page-topbar"><div><p className="eyebrow">INTERVIEW HUB</p><h1>Interview schedule</h1><p>Keep your upcoming placement rounds, meeting links and results in one place.</p></div><div className="topbar-actions"><Link className="secondary" href="/interviews/calendar">Full calendar <ArrowUpRight size={15}/></Link><Link className="primary" href="/my-applications">My applications <ArrowUpRight size={15}/></Link></div></header>
      <div className="stats dashboard-kpis interview-hub-kpis"><div className="stat stat-accent"><div className="stat-icon"><CalendarDays size={18}/></div><span>Upcoming rounds</span><strong>{upcoming.length}</strong><small>Scheduled interviews</small></div><div className="stat"><div className="stat-icon"><Clock3 size={18}/></div><span>Pending results</span><strong>{pending}</strong><small>Awaiting interview outcome</small></div><div className="stat"><div className="stat-icon"><CheckCircle2 size={18}/></div><span>Rounds passed</span><strong>{passed}</strong><small>Recorded as pass</small></div></div>
      {next && <section className="panel next-interview-card"><div className="next-interview-copy"><p className="eyebrow">NEXT INTERVIEW</p><h2>{next.round} · {next.application.drive.company.name}</h2><p>{next.application.drive.role} · {formatDate(next.scheduledAt)}</p></div><div className="next-interview-actions">{next.meetingLink ? <a className="primary" href={next.meetingLink} target="_blank" rel="noreferrer"><Video size={15}/> Join meeting <ExternalLink size={13}/></a> : <span className="secondary"><Clock3 size={15}/> Meeting link not added</span>}<Link className="secondary" href={`/interviews/${next.id}`}>Details</Link></div></section>}
      <div className="interview-hub-grid"><section className="panel interview-hub-panel"><div className="section-heading"><div><p className="eyebrow">UPCOMING</p><h2>Scheduled interviews</h2></div><span className="section-count">{upcoming.length}</span></div>{!upcoming.length ? <div className="hub-empty"><CalendarDays size={20}/><b>No upcoming interviews</b><span>When a placement round is scheduled, it will appear here.</span></div> : <div className="hub-interview-list">{upcoming.map(i => <article className="hub-interview-row" key={i.id}><div className="hub-date"><b>{i.scheduledAt!.toLocaleDateString("en-IN", {day:"2-digit"})}</b><small>{i.scheduledAt!.toLocaleDateString("en-IN", {month:"short"})}</small></div><div className="hub-interview-main"><b>{i.round} · {i.application.drive.company.name}</b><span>{i.application.drive.role} · {i.mode || "Mode not specified"}</span><small>{formatDate(i.scheduledAt)}</small></div><div className="hub-interview-actions">{i.meetingLink && <a className="icon-action" href={i.meetingLink} target="_blank" rel="noreferrer" title="Join meeting"><Video size={15}/></a>}<Link className="icon-action" href={`/interviews/${i.id}`} title="View details"><ArrowUpRight size={15}/></Link></div></article>)}</div>}</section>
        <section className="panel interview-hub-panel"><div className="section-heading"><div><p className="eyebrow">HISTORY</p><h2>Previous rounds</h2></div><span className="section-count">{completed.length}</span></div>{!completed.length ? <div className="hub-empty"><Clock3 size={20}/><b>No interview history</b><span>Completed rounds will appear here.</span></div> : <div className="hub-interview-list">{completed.slice(0, 8).map(i => <article className="hub-interview-row compact" key={i.id}><div className="hub-result-icon">{["PASS","PASSED"].includes(i.result || "") ? <CheckCircle2 size={16}/> : ["FAIL","FAILED"].includes(i.result || "") ? <XCircle size={16}/> : <Clock3 size={16}/>}</div><div className="hub-interview-main"><b>{i.round} · {i.application.drive.company.name}</b><span>{i.application.drive.role}</span><small>{formatDate(i.scheduledAt)}</small></div><span className={`status-badge status-${(i.result || "pending").toLowerCase()}`}>{label(i.result || "PENDING")}</span></article>)}</div>}</section></div>
      <section className="panel interview-prep-panel"><div><p className="eyebrow">BEFORE THE ROUND</p><h2>Interview checklist</h2><p>Use your profile, application and documents as your preparation workspace.</p></div><div className="prep-checklist"><span><CheckCircle2 size={15}/> Keep your resume updated</span><span><CheckCircle2 size={15}/> Review the company and role</span><span><CheckCircle2 size={15}/> Check the meeting link before the round</span><span><CheckCircle2 size={15}/> Watch notifications for result updates</span></div></section>
</WorkspaceShell>;
}
