import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const PAGE_SIZE = 10;

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/dashboard");

  const q = await searchParams;
  const search = (q.search || "").trim();
  const department = q.department || "";
  const status = q.status || "";
  const page = Math.max(1, Number(q.page || 1));

  const where: any = {};
  if (search) {
    where.OR = [
      { usn: { contains: search, mode: "insensitive" } },
      { department: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (department) where.department = department;
  if (status) where.placementStatus = status;

  const [students, total, departments, placed, notPlaced, optedOut] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { user: true },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.student.count({ where }),
    prisma.student.findMany({ select: { department: true }, distinct: ["department"], orderBy: { department: "asc" } }),
    prisma.student.count({ where: { placementStatus: "PLACED" } }),
    prisma.student.count({ where: { placementStatus: "NOT_PLACED" } }),
    prisma.student.count({ where: { placementStatus: "OPTED_OUT" } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const queryLink = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (department) params.set("department", department);
    if (status) params.set("status", status);
    params.set("page", String(p));
    return `/students?${params.toString()}`;
  };

  return (
    <section className="student-module">
      <header className="module-header">
        <div>
          <p className="eyebrow">PLACEMENT OPERATIONS</p>
          <h1>Students</h1>
          <p>Maintain student profiles, academic details and placement status from one workspace.</p>
        </div>
        <Link className="primary" href="/students/new">+ Add Student</Link>
      </header>

      <div className="student-kpis" aria-label="Student summary">
        <div className="student-kpi"><span>Total students</span><strong>{total}</strong><small>Matching current filters</small></div>
        <div className="student-kpi"><span>Placed</span><strong>{placed}</strong><small>Placement status</small></div>
        <div className="student-kpi"><span>Not placed</span><strong>{notPlaced}</strong><small>Available for opportunities</small></div>
        <div className="student-kpi"><span>Opted out</span><strong>{optedOut}</strong><small>Placement opted out</small></div>
      </div>

      <form className="student-filters" method="get">
        <div className="student-search-field"><span aria-hidden="true">⌕</span><input name="search" defaultValue={search} placeholder="Search name, USN, email or department" aria-label="Search students" /></div>
        <select name="department" defaultValue={department} aria-label="Filter by department"><option value="">All departments</option>{departments.map(d => <option key={d.department || "none"} value={d.department || ""}>{d.department || "Not set"}</option>)}</select>
        <select name="status" defaultValue={status} aria-label="Filter by placement status"><option value="">All statuses</option><option value="NOT_PLACED">Not placed</option><option value="PLACED">Placed</option><option value="OPTED_OUT">Opted out</option></select>
        <div className="student-filter-actions">
          <button className="secondary" type="submit">Apply filters</button>
          {(search || department || status) && <Link className="secondary" href="/students">Clear</Link>}
        </div>
      </form>

      <div className="student-table-card">
        <div className="student-table-head"><span>Student</span><span>USN</span><span>Department</span><span>CGPA</span><span>Graduation</span><span>Status</span></div>
        {students.length === 0 ? (
          <div className="student-empty"><div className="student-empty-icon">⌕</div><h3>No students found</h3><p>Try changing your search or filters, or add a new student record.</p>{(search || department || status) && <Link className="secondary" href="/students">Reset filters</Link>}</div>
        ) : students.map(student => (
          <Link href={`/students/${student.id}`} className="student-table-row" key={student.id}>
            <span className="student-identity"><span className="student-avatar">{(student.user.name || "S").slice(0, 1).toUpperCase()}</span><span><strong>{student.user.name || "Unnamed student"}</strong><small>{student.user.email}</small></span></span>
            <span>{student.usn || "—"}</span>
            <span>{student.department || "—"}</span>
            <span>{student.cgpa ?? "—"}</span>
            <span>{student.graduationYear ?? "—"}</span>
            <span><b className={`student-status student-status-${student.placementStatus.toLowerCase()}`}>{student.placementStatus.replace("_", " ")}</b></span>
          </Link>
        ))}
      </div>

      <div className="student-pagination"><span>{total === 0 ? "No results" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}</span><div>{page > 1 && <Link className="secondary" href={queryLink(page - 1)}>← Previous</Link>}<b>Page {page} of {pages}</b>{page < pages && <Link className="secondary" href={queryLink(page + 1)}>Next →</Link>}</div></div>
    </section>
  );
}
