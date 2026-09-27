import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Bookmark, BriefcaseBusiness, CalendarDays, MapPin } from "lucide-react";

export default async function SavedOpportunitiesPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) redirect("/profile");

  const saved = await prisma.savedDrive.findMany({
    where: { studentId: user.student.id },
    include: { drive: { include: { company: true, applications: { where: { studentId: user.student.id }, select: { id: true, status: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return <main className="dashboard">
    <aside className="sidebar"><div className="brand"><div className="logo small">P</div><div><b>PlacementCRM</b><small>Placement workspace</small></div></div><div className="sidebar-section-label">STUDENT WORKSPACE</div><nav>
      <Link className="nav-item" href="/dashboard">Dashboard</Link><Link className="nav-item" href="/opportunities">Opportunities</Link><Link className="nav-item active" href="/saved-opportunities">Saved Opportunities</Link><Link className="nav-item" href="/my-applications">My Applications</Link><Link className="nav-item" href="/interviews">Interviews</Link><Link className="nav-item" href="/offers">Offers</Link><Link className="nav-item" href="/documents">My Documents</Link><Link className="nav-item" href="/notifications">Notifications</Link><Link className="nav-item" href="/profile">My Profile</Link>
    </nav><div className="sidebar-bottom"><span className="role-pill">STUDENT</span><small>Google authentication enabled</small></div></aside>
    <section className="content"><header className="topbar page-topbar"><div><p className="eyebrow">SAVED OPPORTUNITIES</p><h1>Your placement shortlist</h1><p>Keep interesting drives in one place and return to them when you are ready to apply.</p></div><Link className="secondary" href="/opportunities">Explore opportunities <ArrowUpRight size={15}/></Link></header>
      <div className="stats dashboard-kpis"><div className="stat stat-accent"><div className="stat-icon"><Bookmark size={18}/></div><span>Saved drives</span><strong>{saved.length}</strong><small>Your personal shortlist</small></div><div className="stat"><div className="stat-icon"><BriefcaseBusiness size={18}/></div><span>Still active</span><strong>{saved.filter(x => x.drive.status === "ACTIVE").length}</strong><small>Currently open</small></div><div className="stat"><div className="stat-icon"><CalendarDays size={18}/></div><span>With deadlines</span><strong>{saved.filter(x => x.drive.applicationDeadline).length}</strong><small>Track before closing</small></div></div>
      {!saved.length ? <div className="panel opportunity-empty"><Bookmark size={25}/><h2>No saved opportunities yet</h2><p>Use the Save button on an opportunity to build your shortlist.</p><Link className="primary" href="/opportunities">Explore opportunities <ArrowUpRight size={15}/></Link></div> : <div className="saved-opportunity-grid">{saved.map(item => { const drive = item.drive; const application = drive.applications[0]; return <article className="panel saved-opportunity-card" key={item.id}><div className="saved-card-head"><div className="company-avatar">{drive.company.name.charAt(0).toUpperCase()}</div><div><p>{drive.company.name}</p><h3>{drive.role}</h3></div><span className="status-chip">{drive.status}</span></div><div className="saved-card-meta"><span><MapPin size={14}/>{drive.location || "Location not specified"}</span><span><CalendarDays size={14}/>{drive.applicationDeadline ? new Date(drive.applicationDeadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "No deadline"}</span></div><div className="saved-card-footer"><div><strong>{drive.packageLpa ? `₹${drive.packageLpa} LPA` : "Package not specified"}</strong>{application && <small>Applied · {application.status.replaceAll("_", " ")}</small>}</div><Link className="secondary" href={`/drives/${drive.id}`}>View drive <ArrowUpRight size={14}/></Link></div></article>; })}</div>}
    </section>
  </main>;
}
