import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, Circle, FileText, GraduationCap, UserRound, CalendarDays, Bell } from "lucide-react";

function item(ok: boolean, title: string, description: string, href: string, action: string) {
  return { ok, title, description, href, action };
}

export default async function PlacementReadinessPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { student: { include: { documents: true } } },
  });
  if (!user) redirect("/login");

  if (user.role !== "STUDENT" || !user.student) redirect("/dashboard");

  const student = user.student;
  const [applicationCount, interviewCount, offerCount, unreadCount] = await Promise.all([
    prisma.application.count({ where: { studentId: student.id } }),
    prisma.interview.count({ where: { application: { studentId: student.id } } }),
    prisma.offer.count({ where: { application: { studentId: student.id } } }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  const profileComplete = Boolean(
    user.name && user.email && student.phone && student.usn && student.department &&
    student.graduationYear && student.cgpa != null && student.tenthPercentage != null &&
    student.twelfthPercentage != null
  );
  const hasResume = Boolean(student.resumeUrl || student.documents.some((d) => d.type === "RESUME"));
  const hasDocuments = student.documents.length > 0;
  const readinessItems = [
    item(profileComplete, "Complete your student profile", "Add your academic and contact details so recruiters have a complete candidate record.", "/profile/edit", "Complete profile"),
    item(hasResume, "Upload a resume", "Keep a current resume available before applying to placement drives.", "/documents", "Manage documents"),
    item(hasDocuments, "Maintain your documents", "Store certificates and other supporting documents in your document center.", "/documents", "Open documents"),
    item(applicationCount > 0, "Start applying", "Explore eligible placement opportunities and submit applications that match your profile.", "/opportunities", "Explore opportunities"),
    item(interviewCount > 0, "Track interview rounds", "Use the Interview Hub for scheduled rounds, meeting links and outcomes.", "/interview-hub", "Open interview hub"),
    item(offerCount > 0, "Review placement offers", "Offers and joining details are available in your Offer Center.", "/offer-center", "Open offer center"),
  ];

  const completed = readinessItems.filter((x) => x.ok).length;
  const percentage = Math.round((completed / readinessItems.length) * 100);

  return (
    <WorkspaceShell role="STUDENT" active="placement-readiness" notificationCount={unreadCount}>

        <header className="topbar page-topbar dashboard-header">
          <div>
            <p className="eyebrow">STUDENT SUCCESS</p>
            <h1>Placement readiness</h1>
            <p>Use one checklist to keep your profile, documents and placement journey ready.</p>
          </div>
          <div className="topbar-actions"><Link className="secondary" href="/notifications">Notifications {unreadCount ? `(${unreadCount})` : ""} <Bell size={15}/></Link><div className="profile-chip"><div className="avatar">{(user.name || "S").charAt(0).toUpperCase()}</div><div><b>{user.name || "Student"}</b><small>STUDENT</small></div></div></div>
        </header>

        <div className="readiness-hero panel">
          <div className="readiness-hero-copy"><p className="eyebrow">READINESS SCORE</p><h2>{percentage}% ready</h2><p>{completed} of {readinessItems.length} placement milestones are currently complete.</p></div>
          <div className="readiness-ring" aria-label={`${percentage}% placement readiness`}><strong>{percentage}%</strong><span>ready</span></div>
        </div>

        <div className="stats dashboard-kpis readiness-kpis">
          <div className="stat"><div className="stat-icon"><UserRound size={18}/></div><span>Profile</span><strong>{profileComplete ? "Ready" : "Incomplete"}</strong><small>Candidate information</small></div>
          <div className="stat"><div className="stat-icon"><FileText size={18}/></div><span>Documents</span><strong>{student.documents.length}</strong><small>Uploaded records</small></div>
          <div className="stat"><div className="stat-icon"><BriefcaseBusiness size={18}/></div><span>Applications</span><strong>{applicationCount}</strong><small>Submitted applications</small></div>
          <div className="stat"><div className="stat-icon"><CalendarDays size={18}/></div><span>Interviews</span><strong>{interviewCount}</strong><small>Interview rounds</small></div>
        </div>

        <section className="panel readiness-checklist">
          <div className="section-heading"><div><p className="eyebrow">YOUR CHECKLIST</p><h2>Placement milestones</h2></div><Link href="/opportunities">Explore opportunities <ArrowUpRight size={14}/></Link></div>
          <div className="readiness-items">
            {readinessItems.map((r) => <div className={`readiness-item ${r.ok ? "complete" : "pending"}`} key={r.title}>
              <div className="readiness-status">{r.ok ? <CheckCircle2 size={20}/> : <Circle size={20}/>}</div>
              <div className="readiness-copy"><b>{r.title}</b><span>{r.description}</span></div>
              <Link className="secondary" href={r.href}>{r.ok ? "Open" : r.action} <ArrowUpRight size={14}/></Link>
            </div>)}
          </div>
        </section>

        <div className="grid readiness-bottom">
          <section className="panel readiness-tip"><div className="readiness-tip-icon"><GraduationCap size={19}/></div><div><p className="eyebrow">NEXT STEP</p><h2>{profileComplete ? "Keep your placement activity moving" : "Complete your profile first"}</h2><p>{profileComplete ? "Check the Opportunity Center regularly and keep your resume and documents current." : "A complete profile makes your eligibility checks and recruiter records more useful."}</p></div></section>
          <section className="panel readiness-links"><p className="eyebrow">QUICK ACCESS</p><Link href="/profile">My Profile <ArrowUpRight size={14}/></Link><Link href="/documents">My Documents <ArrowUpRight size={14}/></Link><Link href="/my-applications">My Applications <ArrowUpRight size={14}/></Link><Link href="/interview-hub">Interview Hub <ArrowUpRight size={14}/></Link></section>
        </div>
    </WorkspaceShell>
  );
}
