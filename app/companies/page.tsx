import Link from "next/link";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const PAGE_SIZE = 9;

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/dashboard");

  const q = await searchParams;
  const search = (q.search || "").trim();
  const industry = q.industry || "";
  const page = Math.max(1, Number(q.page || 1));
  const where: any = {};
  if (search) where.OR = [
    { name: { contains: search, mode: "insensitive" } },
    { location: { contains: search, mode: "insensitive" } },
    { industry: { contains: search, mode: "insensitive" } },
    { recruiter: { contains: search, mode: "insensitive" } },
  ];
  if (industry) where.industry = industry;

  const [companies, total, industries, allCompanies, activeDrives] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        _count: { select: { drives: true, crmActivities: true } },
        drives: { select: { status: true, _count: { select: { applications: true } } } },
      },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.company.count({ where }),
    prisma.company.findMany({ select: { industry: true }, distinct: ["industry"], orderBy: { industry: "asc" } }),
    prisma.company.count(),
    prisma.placementDrive.count({ where: { status: "ACTIVE" } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const queryLink = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (industry) params.set("industry", industry);
    params.set("page", String(p));
    return `/companies?${params.toString()}`;
  };

  return (
    <section className="company-module">
      <header className="module-header">
        <div><p className="eyebrow">PLACEMENT OPERATIONS</p><h1>Companies</h1><p>Keep recruiting partners, contacts and hiring activity organized.</p></div>
        <Link className="primary" href="/companies/new">+ Add Company</Link>
      </header>

      <div className="company-kpis" aria-label="Company summary">
        <div className="company-kpi"><span>Companies</span><strong>{allCompanies}</strong><small>Total recruiting partners</small></div>
        <div className="company-kpi"><span>Active drives</span><strong>{activeDrives}</strong><small>Currently open in CRM</small></div>
        <div className="company-kpi"><span>Industries</span><strong>{industries.filter(x => x.industry).length}</strong><small>Distinct categories</small></div>
        <div className="company-kpi"><span>Showing</span><strong>{total}</strong><small>Matching current filters</small></div>
      </div>

      <form className="company-filters" method="get">
        <div className="company-search"><span aria-hidden="true">⌕</span><input name="search" defaultValue={search} placeholder="Search company, recruiter, industry or location" aria-label="Search companies" /></div>
        <select name="industry" defaultValue={industry} aria-label="Filter by industry"><option value="">All industries</option>{industries.map(x => <option key={x.industry || "none"} value={x.industry || ""}>{x.industry || "Not set"}</option>)}</select>
        <button className="secondary" type="submit">Apply filters</button>
        {(search || industry) && <Link className="secondary" href="/companies">Clear</Link>}
      </form>

      {companies.length === 0 ? (
        <div className="company-empty"><div className="company-empty-icon">⌕</div><h3>No companies found</h3><p>Try changing the filters or add a new recruiting partner.</p>{(search || industry) && <Link className="secondary" href="/companies">Reset filters</Link>}</div>
      ) : (
        <div className="company-grid company-grid-refined">
          {companies.map(company => <Link href={`/companies/${company.id}`} className="company-card company-card-refined" key={company.id}>
            <div className="company-card-top"><div className="company-icon">{company.name.slice(0, 1).toUpperCase()}</div><span className="company-drive-count">{company.drives.filter(d => d.status === "ACTIVE").length} active · {company._count.drives} total</span></div>
            <h2>{company.name}</h2><p>{company.industry || "Industry not specified"}</p>
            <div className="company-contact"><span>Recruiter</span><strong>{company.recruiter || "Not assigned"}</strong></div>
            <div className="company-meta"><span>{company.location || "Location not specified"}</span><span>{company.drives.reduce((sum, d) => sum + d._count.applications, 0)} applications</span></div>
          </Link>)}
        </div>
      )}

      <div className="student-pagination company-pagination"><span>{total === 0 ? "No results" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}</span><div>{page > 1 && <Link className="secondary" href={queryLink(page - 1)}>← Previous</Link>}<b>Page {page} of {pages}</b>{page < pages && <Link className="secondary" href={queryLink(page + 1)}>Next →</Link>}</div></div>
    </section>
  );
}
