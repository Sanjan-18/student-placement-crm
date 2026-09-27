import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) return NextResponse.json({ error: "Student profile required" }, { status: 403 });
  const saved = await prisma.savedDrive.findMany({
    where: { studentId: user.student.id },
    include: { drive: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(saved);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) return NextResponse.json({ error: "Student profile required" }, { status: 403 });
  const body = await request.json().catch(() => null) as { driveId?: string } | null;
  if (!body?.driveId) return NextResponse.json({ error: "driveId is required" }, { status: 400 });
  const drive = await prisma.placementDrive.findUnique({ where: { id: body.driveId } });
  if (!drive) return NextResponse.json({ error: "Drive not found" }, { status: 404 });
  const saved = await prisma.savedDrive.upsert({
    where: { studentId_driveId: { studentId: user.student.id, driveId: drive.id } },
    create: { studentId: user.student.id, driveId: drive.id },
    update: {},
  });
  return NextResponse.json(saved, { status: 201 });
}
