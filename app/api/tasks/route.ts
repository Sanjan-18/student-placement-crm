import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });

  const tasks = await prisma.placementTask.findMany({
    where: { studentId: user.student.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Task title is required" }, { status: 400 });
  if (title.length > 120) return NextResponse.json({ error: "Task title is too long" }, { status: 400 });

  const priority = ["LOW", "MEDIUM", "HIGH"].includes(body.priority) ? body.priority : "MEDIUM";
  const dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) return NextResponse.json({ error: "Invalid due date" }, { status: 400 });

  const task = await prisma.placementTask.create({
    data: { studentId: user.student.id, title, description: String(body.description ?? "").trim() || null, priority, dueDate },
  });
  return NextResponse.json(task, { status: 201 });
}
