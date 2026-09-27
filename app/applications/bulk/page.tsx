import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BulkToolbar from "@/components/workflow/BulkToolbar";

export default async function BulkApplicationsPage() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) return <main className="content"><h1>Access denied</h1></main>;
  const applications = await prisma.application.findMany({ include: { student: { include: { user: true } }, drive: { include: { company: true } } }, orderBy: { appliedAt: "desc" }, take: 100 });
  return <main className="dashboard"><aside className="sidebar"><div className="brand"><div className="logo small">P</div><b>PlacementCRM</b></div><nav><Link className="nav-item" href="/dashboard">Dashboard</Link><Link className="nav-item active" href="/applications">Applications</Link></nav></aside><section className="content"><header className="topbar"><div><h1>Bulk Application Control</h1><p>Manage application stages for placement operations</p></div></header><BulkToolbar /><div className="panel table-panel">{applications.map(a => <label className="bulk-row" key={a.id}><input type="checkbox" name="ids" value={a.id}/><span><strong>{a.student.user.name || "Student"}</strong><small>{a.drive.company.name} — {a.drive.role}</small></span><b className="status">{a.status}</b></label>)}</div></section></main>;
}
