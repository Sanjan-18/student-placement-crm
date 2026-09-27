import Link from "next/link";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const PAGE_SIZE = 9;
const fmt = (value: Date | null) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value) : "No deadline";

export default async function DrivesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const q = await searchParams;
  const search = (q.search || "").trim();
  const status = q.status || "";
  const page = Math.max(1, Number(q.page || 1));
  const where: any = {};
  if (search) where.OR = [
    { role: { contains: search, mode: "insensitive" } },
    { location: { contains: search, mode: "insensitive" } },
    { company: { name: { contains: search, mode: "insensitive" } } },
  ];
  if (status) where.status = status;

  const [drives, total, active, closed, applications] = await Promise.all([
    prisma.placementDrive.findMany({ where, include: { company: true, _count: { select: { applications: true } } }, orderBy: [{ status: "asc" }, { applicationDeadline: "asc" }, { createdAt: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.placementDrive.count({ where }),
    prisma.placementDrive.count({ where: { status: "ACTIVE" } }),
    prisma.placementDrive.count({ where: { status: { in: ["CLOSED", "COMPLETED"] } } }),
    prisma.application.count(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) => { const params = new URLSearchParams(); if (search) params.set("search", search); if (status) params.set("status", status); params.set("page", String(p)); return `/drives?${params}`; };

  return <WorkspaceShell role={session.user.role} active="drives" global>
    <section className="drive-module">
      <header className="module-header"><div><p className="eyebrow">PLACEMENT OPERATIONS</p><h1>Placement Drives</h1><p>Manage hiring roles, timelines, eligibility and application activity.</p></div>{["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role) && <Link className="primary" href="/drives/new">+ New Drive</Link>}</header>
      <div className="drive-kpis"><div><span>Total drives</span><strong>{await prisma.placementDrive.count()}</strong><small>All hiring drives</small></div><div><span>Active</span><strong>{active}</strong><small>Open for applications</small></div><div><span>Closed / completed</span><strong>{closed}</strong><small>Finished recruitment</small></div><div><span>Applications</span><strong>{applications}</strong><small>Across all drives</small></div></div>
      <form className="drive-filters" method="get"><div className="drive-search"><span aria-hidden="true">⌕</span><input name="search" defaultValue={search} placeholder="Search role, company or location" aria-label="Search placement drives" /></div><select name="status" defaultValue={status} aria-label="Filter by status"><option value="">All statuses</option><option value="ACTIVE">ACTIVE</option><option value="CLOSED">CLOSED</option><option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option></select><button className="secondary" type="submit">Apply filters</button>{(search || status) && <Link className="secondary" href="/drives">Clear</Link>}</form>
      {drives.length === 0 ? <div className="drive-empty"><div className="company-empty-icon">⌕</div><h3>No placement drives found</h3><p>Try changing the filters or create a new hiring drive.</p>{(search || status) && <Link className="secondary" href="/drives">Reset filters</Link>}</div> : <div className="drive-list drive-list-refined">{drives.map(d => <Link className="drive-card drive-card-refined" href={`/drives/${d.id}`} key={d.id}><div className="drive-top"><div className="company-icon">{d.company.name.charAt(0).toUpperCase()}</div><span className={`drive-status drive-status-${d.status.toLowerCase()}`}>{d.status.replaceAll("_", " ")}</span></div><h2>{d.role}</h2><p className="muted">{d.company.name}</p><div className="drive-info"><span>{d.location || "Location not set"}</span><span>{d.packageLpa ? `₹${d.packageLpa} LPA` : "Package not set"}</span></div><div className="drive-footer"><span>{d.applicationDeadline ? `Deadline: ${fmt(d.applicationDeadline)}` : "No application deadline"}</span><b>{d._count.applications} applications</b></div></Link>)}</div>}
      <div className="pagination"><span>{total === 0 ? "No results" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}</span><div>{page > 1 && <Link className="secondary" href={link(page - 1)}>← Previous</Link>}<b>Page {page} of {pages}</b>{page < pages && <Link className="secondary" href={link(page + 1)}>Next →</Link>}</div></div>
    </section>
  </WorkspaceShell>;
}
