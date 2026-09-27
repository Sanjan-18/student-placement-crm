import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminUserTable from "@/components/admin/AdminUserTable";
import Link from "next/link";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    include: { student: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  const serialized = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    hasStudentProfile: Boolean(user.student),
  }));

  return (
    <section className="admin-users-page">
      <div className="admin-back-bar">
        <Link href="/admin/control-center" className="back-link">
          ← Back to Control Center
        </Link>
      </div>
      <header className="topbar page-topbar admin-users-topbar">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>User Management</h1>
          <p className="muted">Manage account roles, permissions and platform access from one focused workspace.</p>
        </div>
        <div className="topbar-actions admin-topbar-actions">
          <Link className="secondary" href="/admin/control-center">Control Center</Link>
          <Link className="secondary" href="/admin/audit">Audit Log</Link>
        </div>
      </header>
      <AdminUserTable users={serialized} currentUserId={session.user.id} />
    </section>
  );
}
