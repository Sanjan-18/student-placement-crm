import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) return NextResponse.json({ error: "Student profile required" }, { status: 403 });
  const { id } = await params;
  const saved = await prisma.savedDrive.findUnique({ where: { id } });
  if (!saved || saved.studentId !== user.student.id) return NextResponse.json({ error: "Saved opportunity not found" }, { status: 404 });
  await prisma.savedDrive.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
