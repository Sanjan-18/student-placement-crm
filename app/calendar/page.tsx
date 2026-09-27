import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CalendarDays, Clock3, Gift, Video } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import PlacementCalendar from "@/components/calendar/PlacementCalendar";

function dateKey(value: Date) { return value.toISOString().slice(0, 10); }
function timeLabel(value: Date) { return value.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }

export default async function PlacementCalendarPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user) redirect("/login");
  const now = new Date();
  const horizon = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const isStudent = user.role === "STUDENT" && !!user.student;
  const studentId = user.student?.id;
  const [drives, interviews, offers] = await Promise.all([
    prisma.placementDrive.findMany({ where: { status: "ACTIVE", OR: [{ applicationDeadline: { gte: now, lte: horizon } }, { driveDate: { gte: now, lte: horizon } }] }, include: { company: true }, orderBy: { applicationDeadline: "asc" } }),
    prisma.interview.findMany({ where: { scheduledAt: { gte: now, lte: horizon }, result: { not: "CANCELLED" }, ...(isStudent ? { application: { studentId } } : {}) }, include: { application: { include: { drive: { include: { company: true } } } } }, orderBy: { scheduledAt: "asc" } }),
    prisma.offer.findMany({ where: { joiningDate: { gte: now, lte: horizon }, ...(isStudent ? { application: { studentId } } : {}) }, include: { application: { include: { drive: { include: { company: true } } } } }, orderBy: { joiningDate: "asc" } }),
  ]);
  const events: Array<{id:string;date:string;title:string;subtitle:string;type:"INTERVIEW"|"DEADLINE"|"DRIVE"|"JOINING";href:string;time?:string}> = [];
  drives.forEach(d => {
    if (d.applicationDeadline) events.push({ id: `deadline-${d.id}`, date: dateKey(d.applicationDeadline), title: `${d.company.name} · ${d.role}`, subtitle: `Application deadline · ${d.location || "Location not specified"}`, type: "DEADLINE", href: `/drives/${d.id}`, time: timeLabel(d.applicationDeadline) });
    if (d.driveDate) events.push({ id: `drive-${d.id}`, date: dateKey(d.driveDate), title: `${d.company.name} · ${d.role}`, subtitle: `Placement drive · ${d.location || "Location not specified"}`, type: "DRIVE", href: `/drives/${d.id}`, time: timeLabel(d.driveDate) });
  });
  interviews.forEach(i => { if (i.scheduledAt) events.push({ id: `interview-${i.id}`, date: dateKey(i.scheduledAt), title: `${i.round} · ${i.application.drive.company.name}`, subtitle: `${i.application.drive.role} · ${i.mode || "Mode not specified"}`, type: "INTERVIEW", href: `/interviews/${i.id}`, time: timeLabel(i.scheduledAt) }); });
  offers.forEach(o => { if (o.joiningDate) events.push({ id: `joining-${o.id}`, date: dateKey(o.joiningDate), title: `${o.application.drive.company.name} · ${o.application.drive.role}`, subtitle: `Offer joining date · ${o.packageLpa ? `${o.packageLpa} LPA` : "Package not specified"}`, type: "JOINING", href: `/offers/${o.id}`, time: timeLabel(o.joiningDate) }); });
  events.sort((a,b) => `${a.date}${a.time || ""}`.localeCompare(`${b.date}${b.time || ""}`));
  const counts = { interviews: events.filter(e => e.type === "INTERVIEW").length, deadlines: events.filter(e => e.type === "DEADLINE").length, drives: events.filter(e => e.type === "DRIVE").length, joining: events.filter(e => e.type === "JOINING").length };
  return <WorkspaceShell role={user.role} active="calendar" notificationCount={0}>
<header className="topbar page-topbar"><div><p className="eyebrow">PLACEMENT WORKSPACE</p><h1>Placement Calendar</h1><p>{isStudent ? "Keep every important placement date visible before it becomes a deadline." : "A shared timeline for drives, interviews, deadlines and joining milestones."}</p></div><div className="topbar-actions"><Link className="secondary" href="/notifications/reminders">Reminders <ArrowUpRight size={15}/></Link></div></header>
    <div className="stats dashboard-kpis calendar-kpis"><div className="stat stat-accent"><div className="stat-icon"><Video size={18}/></div><span>Interviews</span><strong>{counts.interviews}</strong><small>Next 60 days</small></div><div className="stat"><div className="stat-icon"><Clock3 size={18}/></div><span>Deadlines</span><strong>{counts.deadlines}</strong><small>Applications closing</small></div><div className="stat"><div className="stat-icon"><CalendarDays size={18}/></div><span>Drive dates</span><strong>{counts.drives}</strong><small>Upcoming placement drives</small></div><div className="stat"><div className="stat-icon"><Gift size={18}/></div><span>Joining</span><strong>{counts.joining}</strong><small>Offer milestones</small></div></div>
    <PlacementCalendar events={events}/>
</WorkspaceShell>;
}
