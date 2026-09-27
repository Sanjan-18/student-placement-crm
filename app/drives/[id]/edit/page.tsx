import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import DriveForm from "@/components/drives/DriveForm";

export default async function EditDrive({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) redirect("/drives");
  const { id } = await params;
  const [drive, companies] = await Promise.all([
    prisma.placementDrive.findUnique({ where: { id } }),
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!drive) notFound();
  return <WorkspaceShell role={session.user.role} active="drives" global><section className="drive-editor-page"><div className="editor-back"><Link href={`/drives/${id}`}>← Back to drive</Link></div><DriveForm companies={companies} drive={drive} /></section></WorkspaceShell>;
}
