import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BriefcaseBusiness,
  Clock3,
  FileText,
  Search,
} from "lucide-react";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

const statuses: ApplicationStatus[] = [
  "APPLIED",
  "SHORTLISTED",
  "APTITUDE",
  "TECHNICAL",
  "HR",
  "SELECTED",
  "REJECTED",
  "OFFERED",
  "ACCEPTED",
  "WITHDRAWN",
];

const label = (v: string) =>
  v
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();

  if (!session?.user) return redirect("/login");

  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role))
    return redirect("/my-applications");

  const q = await searchParams;

  const search = (q.search || "").trim();
  const status = q.status || "";
  const page = Math.max(1, Number(q.page || 1));
  const pageSize = 12;

  const where: any = {};

  if (search)
    where.OR = [
      {
        student: {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        student: {
          usn: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        drive: {
          role: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        drive: {
          company: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
    ];

  if (status) where.status = status;

  const [
    applications,
    total,
    statusCounts,
    companyCount,
    studentCount,
  ] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        drive: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    prisma.application.count({
      where,
    }),

    Promise.all(
      statuses.map((s) =>
        prisma.application.count({
          where: {
            status: s,
          },
        })
      )
    ),

    prisma.company.count(),

    prisma.student.count(),
  ]);

  const counts = Object.fromEntries(
    statuses.map((s, i) => [s, statusCounts[i]])
  );

  const pages = Math.max(1, Math.ceil(total / pageSize));

  const link = (p: number) =>
    `/applications?${new URLSearchParams({
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      page: String(p),
    })}`;

  return (
    <WorkspaceShell role={session.user.role} active="applications">
      <section className="application-module">
        <header className="application-page-header">
          <div>
            <p className="eyebrow">APPLICATION MANAGEMENT</p>
            <h1>Applications</h1>
            <p>Track candidates through every placement stage.</p>
          </div>

          <Link className="primary" href="/applications/bulk">
            Bulk control
          </Link>
        </header>

        <div className="application-kpis">
          <div>
            <span>Total applications</span>
            <strong>
              {Object.values(counts).reduce((a, b) => a + b, 0)}
            </strong>
            <small>Across all drives</small>
          </div>

          <div>
            <span>Active pipeline</span>
            <strong>
              {statuses.slice(0, 6).reduce((a, s) => a + counts[s], 0)}
            </strong>
            <small>Applicants still progressing</small>
          </div>

          <div>
            <span>Selected</span>
            <strong>
              {counts.SELECTED + counts.OFFERED + counts.ACCEPTED}
            </strong>
            <small>Selected or offer stage</small>
          </div>

          <div>
            <span>Companies</span>
            <strong>{companyCount}</strong>
            <small>{studentCount} students in CRM</small>
          </div>
        </div>

        <div className="application-stage-strip">
          {[
            "APPLIED",
            "SHORTLISTED",
            "APTITUDE",
            "TECHNICAL",
            "HR",
            "SELECTED",
            "OFFERED",
            "ACCEPTED",
          ].map((s) => (
            <Link
              key={s}
              href={`/applications?status=${s}`}
              className={status === s ? "active" : ""}
            >
              <span>{label(s)}</span>
              <b>{counts[s]}</b>
            </Link>
          ))}
        </div>

        <form className="application-filters" method="get">
          <div className="application-search">
            <Search size={16} />

            <input
              name="search"
              defaultValue={search}
              placeholder="Search student, USN, company or role"
              aria-label="Search applications"
            />
          </div>

          <select
            name="status"
            defaultValue={status}
            aria-label="Filter by application stage"
          >
            <option value="">All stages</option>

            {statuses.map((x) => (
              <option key={x} value={x}>
                {label(x)}
              </option>
            ))}
          </select>

          <button className="secondary">Apply filters</button>

          <Link className="secondary" href="/applications">
            Clear
          </Link>
        </form>

        <div className="application-list-head">
          <div>
            <h2>Candidate pipeline</h2>
            <p>
              {total} matching application{total === 1 ? "" : "s"}
            </p>
          </div>

          <span>
            <Clock3 size={14} /> Newest first
          </span>
        </div>

        <div className="application-table panel">
          <div className="application-table-head">
            <span>Candidate</span>
            <span>Opportunity</span>
            <span>Stage</span>
            <span>Applied</span>
            <span></span>
          </div>

          {applications.length === 0 ? (
            <div className="application-empty">
              <div>
                <FileText size={22} />
              </div>

              <h3>No applications found</h3>

              <p>
                Try a different search term or clear the current filters.
              </p>

              <Link className="secondary" href="/applications">
                Reset filters
              </Link>
            </div>
          ) : (
            applications.map((a) => (
              <Link
                className="application-table-row"
                href={`/applications/${a.id}`}
                key={a.id}
              >
                <span className="candidate-cell">
                  <span className="candidate-avatar">
                    {(a.student.user.name || "S").charAt(0).toUpperCase()}
                  </span>

                  <span>
                    <strong>
                      {a.student.user.name || "Unnamed student"}
                    </strong>

                    <small>
                      {a.student.usn || a.student.user.email}
                    </small>
                  </span>
                </span>

                <span className="opportunity-cell">
                  <strong>{a.drive.role}</strong>

                  <small>
                    <BriefcaseBusiness size={12} />{" "}
                    {a.drive.company.name}
                  </small>
                </span>

                <span>
                  <b
                    className={`application-status status-${a.status.toLowerCase()}`}
                  >
                    {label(a.status)}
                  </b>
                </span>

                <span className="date-cell">
                  {a.appliedAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                <span className="row-arrow">
                  View <span>→</span>
                </span>
              </Link>
            ))
          )}
        </div>

        <div className="application-pagination">
          <span>
            Page {page} of {pages}
          </span>

          <div>
            {page > 1 && (
              <Link className="secondary" href={link(page - 1)}>
                ← Previous
              </Link>
            )}

            {page < pages && (
              <Link className="secondary" href={link(page + 1)}>
                Next →
              </Link>
            )}
          </div>
        </div>
      </section>
    </WorkspaceShell>
  );
}