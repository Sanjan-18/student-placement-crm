import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getStudent(email: string) {
  return prisma.user.findUnique({ where: { email }, include: { student: true } });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getStudent(session.user.email);
  if (!user?.student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  const { id } = await context.params;
  const existing = await prisma.placementTask.findFirst({ where: { id, studentId: user.student.id } });
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const body = await request.json();
  const data: { title?: string; description?: string | null; dueDate?: Date | null; priority?: string; status?: string } = {};
  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.description !== undefined) data.description = String(body.description).trim() || null;
  if (body.priority !== undefined && ["LOW", "MEDIUM", "HIGH"].includes(body.priority)) data.priority = body.priority;
  if (body.status !== undefined && ["TODO", "DONE"].includes(body.status)) data.status = body.status;
  if (body.dueDate !== undefined) {
    const date = body.dueDate ? new Date(body.dueDate) : null;
    if (date && Number.isNaN(date.getTime())) return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
    data.dueDate = date;
  }
  if (data.title === "") return NextResponse.json({ error: "Task title is required" }, { status: 400 });

  const task = await prisma.placementTask.update({ where: { id }, data });
  return NextResponse.json(task);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getStudent(session.user.email);
  if (!user?.student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  const { id } = await context.params;
  const existing = await prisma.placementTask.findFirst({ where: { id, studentId: user.student.id } });
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  await prisma.placementTask.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
