import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminUserTable from "@/components/admin/AdminUserTable";

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
    <main className="legacy-page-content admin-users-page">
      <header className="topbar page-topbar">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>User Management</h1>
          <p className="muted">Manage account roles and access from one focused workspace.</p>
        </div>
      </header>
      <AdminUserTable users={serialized} currentUserId={session.user.id} />
    </main>
  );
}
