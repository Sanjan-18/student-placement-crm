import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentForm from "@/components/students/StudentForm";
import WorkspaceShell from "@/components/layout/WorkspaceShell";

export default async function NewStudentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/dashboard");
  return <WorkspaceShell role={session.user.role} active="students"><section className="student-editor"><div className="editor-back"><a href="/students">← Back to students</a></div><StudentForm /></section></WorkspaceShell>;
}
