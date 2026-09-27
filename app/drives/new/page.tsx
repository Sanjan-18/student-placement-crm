import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import DriveForm from "@/components/drives/DriveForm";

export default async function NewDrive() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/drives");
  const companies = await prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return <WorkspaceShell role={session.user.role} active="drives" global><section className="drive-editor-page"><div className="editor-back"><Link href="/drives">← Back to placement drives</Link></div><DriveForm companies={companies} /></section></WorkspaceShell>;
}
