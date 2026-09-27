import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, CheckSquare, Target } from "lucide-react";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import TaskBoard from "@/components/tasks/TaskBoard";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) redirect("/dashboard");
  const tasks = await prisma.placementTask.findMany({ where: { studentId: user.student.id }, orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }] });
  const open = tasks.filter(t => t.status !== "DONE").length;
  const high = tasks.filter(t => t.status !== "DONE" && t.priority === "HIGH").length;
  return <WorkspaceShell role={"STUDENT"} active="tasks" notificationCount={0}>
<header className="topbar page-topbar"><div><p className="eyebrow">ACTION PLANNER</p><h1>Your placement action plan</h1><p>Keep small placement tasks visible so applications, interviews and profile updates don't get missed.</p></div><div className="topbar-actions"><Link className="secondary" href="/placement-readiness"><Target size={15}/> Readiness</Link><Link className="primary" href="/opportunities"><ArrowUpRight size={15}/> Explore roles</Link></div></header><div className="stats dashboard-kpis"><div className="stat stat-accent"><div className="stat-icon"><CheckSquare size={18}/></div><span>Open tasks</span><strong>{open}</strong><small>Actions remaining</small></div><div className="stat"><div className="stat-icon"><Target size={18}/></div><span>High priority</span><strong>{high}</strong><small>Need attention</small></div><div className="stat"><div className="stat-icon"><CheckSquare size={18}/></div><span>Completed</span><strong>{tasks.length - open}</strong><small>Finished actions</small></div></div><TaskBoard initialTasks={tasks.map(t => ({ ...t, dueDate: t.dueDate?.toISOString() ?? null }))}/></WorkspaceShell>;
}
