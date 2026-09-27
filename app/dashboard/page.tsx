import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Handshake,
  Plus,
  Users,
} from "lucide-react";

function formatDate(value: Date | null | undefined) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusTone(value: string) {
  const normalized = value.toLowerCase();
  if (["accepted", "selected", "offered", "placed"].some((item) => normalized.includes(item))) return "success";
  if (["rejected", "declined", "withdrawn", "cancelled"].some((item) => normalized.includes(item))) return "danger";
  if (["shortlisted", "technical", "aptitude", "hr"].some((item) => normalized.includes(item))) return "warning";
  return "neutral";
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { student: true },
  });

  if (!user) redirect("/login");

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const isStudent = user.role === "STUDENT";
  const studentId = user.student?.id;

  const [
    students,
    companies,
    activeDrives,
    applications,
    offers,
    placed,
    upcomingInterviews,
    upcomingInterviewCount,
    upcomingDrives,
    recentApplications,
    unreadNotifications,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.company.count(),
    prisma.placementDrive.count({ where: { status: "ACTIVE" } }),
    prisma.application.count(studentId ? { where: { studentId } } : undefined),
    prisma.offer.count(studentId ? { where: { application: { studentId } } } : undefined),
    prisma.student.count({ where: { placementStatus: "PLACED" } }),
    prisma.interview.findMany({
      where: {
        scheduledAt: { gte: now, lte: nextWeek },
        ...(studentId ? { application: { studentId } } : {}),
      },
      include: {
        application: {
          include: {
            student: { include: { user: true } },
            drive: { include: { company: true } },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.interview.count({
      where: {
        scheduledAt: { gte: now, lte: nextWeek },
        ...(studentId ? { application: { studentId } } : {}),
      },
    }),
    prisma.placementDrive.findMany({
      where: {
        status: "ACTIVE",
        applicationDeadline: { gte: now, lte: nextWeek },
      },
      include: { company: true },
      orderBy: { applicationDeadline: "asc" },
      take: 5,
    }),
    prisma.application.findMany({
      where: studentId ? { studentId } : {},
      include: {
        student: { include: { user: true } },
        drive: { include: { company: true } },
      },
      orderBy: { appliedAt: "desc" },
      take: 6,
    }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  const placementRate = students ? Math.round((placed / students) * 100) : 0;
  const profileComplete = studentId
    ? [user.name, user.email, user.student?.phone, user.student?.usn, user.student?.department, user.student?.graduationYear, user.student?.cgpa, user.student?.resumeUrl].filter(Boolean).length
    : 0;
  const profilePercent = studentId ? Math.round((profileComplete / 8) * 100) : 100;

  const kpis = isStudent
    ? [
        { label: "My Applications", value: applications, note: "Submitted applications", icon: FileText },
        { label: "Active Drives", value: activeDrives, note: "Currently open", icon: BriefcaseBusiness },
        { label: "Upcoming Interviews", value: upcomingInterviewCount, note: "Next 7 days", icon: CalendarDays },
        { label: "My Offers", value: offers, note: "Offers received", icon: Handshake },
      ]
    : [
        { label: "Students", value: students, note: "Registered candidates", icon: GraduationCap },
        { label: "Companies", value: companies, note: "Partner organizations", icon: Building2 },
        { label: "Active Drives", value: activeDrives, note: "Open opportunities", icon: BriefcaseBusiness },
        { label: "Upcoming Interviews", value: upcomingInterviewCount, note: "Next 7 days", icon: CalendarDays },
      ];

  return (
    <WorkspaceShell role={user.role} active="dashboard" notificationCount={unreadNotifications}>
      <header className="page-topbar dashboard-v2-header">
        <div>
          <p className="eyebrow">{isStudent ? "STUDENT PLACEMENT" : "PLACEMENT OPERATIONS"}</p>
          <h1>Good to see you, {user.name?.split(" ")[0] || "there"}</h1>
          <p>{isStudent ? "Everything you need to manage your placement journey, in one place." : "A focused view of candidates, opportunities and placement activity."}</p>
        </div>
        <div className="dashboard-v2-actions">
          <Link className="secondary" href="/notifications"><Bell size={15} /> Notifications{unreadNotifications > 0 && <span className="dashboard-v2-badge">{unreadNotifications}</span>}</Link>
          <Link className="primary" href={isStudent ? "/opportunities" : "/drives"}>
            {isStudent ? <BriefcaseBusiness size={15} /> : <Plus size={15} />}
            {isStudent ? "Explore opportunities" : "Manage drives"}
          </Link>
        </div>
      </header>

      <section className="dashboard-v2-kpis" aria-label="Placement summary">
        {kpis.map(({ label, value, note, icon: Icon }, index) => (
          <article className={`dashboard-v2-kpi ${index === 0 ? "is-primary" : ""}`} key={label}>
            <div className="dashboard-v2-kpi-icon"><Icon size={17} /></div>
            <div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
          </article>
        ))}
      </section>

      <section className="dashboard-v2-focus">
        <article className="panel dashboard-v2-progress">
          <div className="dashboard-v2-section-head">
            <div><p className="eyebrow">{isStudent ? "YOUR PROGRESS" : "PLACEMENT OVERVIEW"}</p><h2>{isStudent ? "Placement readiness" : "Placement rate"}</h2></div>
            <strong>{isStudent ? `${profilePercent}%` : `${placementRate}%`}</strong>
          </div>
          <div className="dashboard-v2-progress-track"><span style={{ width: `${isStudent ? profilePercent : placementRate}%` }} /></div>
          <p>{isStudent ? "Complete your profile so recruiters have the information they need." : `${placed} of ${students} registered students are currently marked as placed.`}</p>
          <Link className="text-link" href={isStudent ? "/profile" : "/analytics"}>{isStudent ? "Complete profile" : "View placement analytics"} <ArrowRight size={14} /></Link>
        </article>

        <article className="panel dashboard-v2-next">
          <div className="dashboard-v2-section-head"><div><p className="eyebrow">NEXT STEP</p><h2>{isStudent ? "Keep moving" : "Priority work"}</h2></div><CheckCircle2 size={19} /></div>
          {isStudent ? (
            <div className="dashboard-v2-next-list">
              <Link href="/my-applications"><FileText size={16} /><span><b>Review applications</b><small>{applications} total applications</small></span><ArrowRight size={14} /></Link>
              <Link href="/interview-hub"><CalendarDays size={16} /><span><b>Prepare for interviews</b><small>{upcomingInterviewCount} upcoming this week</small></span><ArrowRight size={14} /></Link>
            </div>
          ) : (
            <div className="dashboard-v2-next-list">
              <Link href="/applications"><FileText size={16} /><span><b>Review candidate applications</b><small>Manage the current pipeline</small></span><ArrowRight size={14} /></Link>
              <Link href="/interviews"><CalendarDays size={16} /><span><b>Manage interviews</b><small>{upcomingInterviewCount} scheduled this week</small></span><ArrowRight size={14} /></Link>
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-v2-columns">
        <article className="panel dashboard-v2-list">
          <div className="dashboard-v2-section-head"><div><p className="eyebrow">NEXT 7 DAYS</p><h2>Upcoming interviews</h2></div><Link className="text-link" href="/interviews">View all <ArrowRight size={14} /></Link></div>
          {upcomingInterviews.length === 0 ? (
            <div className="dashboard-v2-empty"><Clock3 size={18} /><div><b>No interviews scheduled</b><span>Your upcoming interview schedule will appear here.</span></div></div>
          ) : upcomingInterviews.map((item) => (
            <Link className="dashboard-v2-list-row" href={`/interviews/${item.id}`} key={item.id}>
              <span className="dashboard-v2-row-icon"><CalendarDays size={16} /></span>
              <span><b>{item.application.drive.company.name}</b><small>{item.round} · {item.application.drive.role}{!isStudent && ` · ${item.application.student.user.name || "Student"}`}</small></span>
              <time>{formatDate(item.scheduledAt)}</time><ArrowRight size={14} />
            </Link>
          ))}
        </article>

        <article className="panel dashboard-v2-list">
          <div className="dashboard-v2-section-head"><div><p className="eyebrow">DEADLINES</p><h2>Drives closing soon</h2></div><Link className="text-link" href="/drives">View all <ArrowRight size={14} /></Link></div>
          {upcomingDrives.length === 0 ? (
            <div className="dashboard-v2-empty"><BriefcaseBusiness size={18} /><div><b>No upcoming deadlines</b><span>Active drive deadlines will appear here.</span></div></div>
          ) : upcomingDrives.map((drive) => (
            <Link className="dashboard-v2-list-row" href={`/drives/${drive.id}`} key={drive.id}>
              <span className="dashboard-v2-row-icon"><BriefcaseBusiness size={16} /></span>
              <span><b>{drive.company.name}</b><small>{drive.role}{drive.packageLpa ? ` · ₹${drive.packageLpa} LPA` : ""}</small></span>
              <time>{formatDate(drive.applicationDeadline)}</time><ArrowRight size={14} />
            </Link>
          ))}
        </article>
      </section>

      <section className="panel dashboard-v2-applications">
        <div className="dashboard-v2-section-head"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>{isStudent ? "My recent applications" : "Recent applications"}</h2></div><Link className="text-link" href={isStudent ? "/my-applications" : "/applications"}>View all <ArrowRight size={14} /></Link></div>
        {recentApplications.length === 0 ? (
          <div className="dashboard-v2-empty"><FileText size={18} /><div><b>No applications yet</b><span>Application activity will appear here once candidates start applying.</span></div></div>
        ) : (
          <div className="dashboard-v2-table-wrap">
            <div className="dashboard-v2-table-head"><span>Candidate</span><span>Company / role</span><span>Status</span><span>Applied</span></div>
            {recentApplications.map((application) => (
              <Link className="dashboard-v2-table-row" href={`/applications/${application.id}`} key={application.id}>
                <span><b>{application.student.user.name || "Student"}</b><small>{application.student.usn || application.student.user.email}</small></span>
                <span><b>{application.drive.company.name}</b><small>{application.drive.role}</small></span>
                <span><em className={`status-chip ${statusTone(application.status)}`}>{statusLabel(application.status)}</em></span>
                <time>{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(application.appliedAt)}</time>
              </Link>
            ))}
          </div>
        )}
      </section>
    </WorkspaceShell>
  );
}
