import { interviewWorkflow } from "@/lib/workflows";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const i = await prisma.interview.findUnique({
    where: { id },
    include: { application: { include: { student: { include: { user: true } }, drive: { include: { company: true } } } } },
  });
  if (!i) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  if (s.user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: s.user.id }, select: { id: true } });
    if (i.application.studentId !== student?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(i);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await auth();
  if (!s?.user || !["ADMIN", "PLACEMENT_OFFICER"].includes(s.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const i = await prisma.interview.findUnique({ where: { id }, include: { application: true } });
  if (!i) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  const data: Record<string, unknown> = {};
  if (body.round !== undefined) {
    const round = String(body.round).trim();
    if (!round || round.length > 80) return NextResponse.json({ error: "Round must be between 1 and 80 characters" }, { status: 400 });
    data.round = round;
  }
  if (body.mode !== undefined) {
    const mode = body.mode ? String(body.mode).toUpperCase() : null;
    if (mode && !["ONLINE", "OFFLINE", "PHONE"].includes(mode)) return NextResponse.json({ error: "Invalid interview mode" }, { status: 400 });
    data.mode = mode;
  }
  if (body.meetingLink !== undefined) {
    const link = body.meetingLink ? String(body.meetingLink).trim() : null;
    if (link && !/^https?:\/\//i.test(link)) return NextResponse.json({ error: "Meeting link must be a valid HTTP(S) URL" }, { status: 400 });
    data.meetingLink = link;
  }
  if (body.result !== undefined) {
    const result = String(body.result).toUpperCase();
    if (!["PENDING", "PASS", "FAIL", "CANCELLED", "RESCHEDULED"].includes(result)) return NextResponse.json({ error: "Invalid interview result" }, { status: 400 });
    data.result = result;
  }
  if (body.scheduledAt !== undefined) {
    if (!body.scheduledAt) data.scheduledAt = null;
    else { const date = new Date(body.scheduledAt); if (Number.isNaN(date.getTime())) return NextResponse.json({ error: "Invalid scheduled date" }, { status: 400 }); data.scheduledAt = date; }
  }
  const updated = await prisma.interview.update({ where: { id }, data });
  if (body.result) {
    const result = String(body.result).toUpperCase();
    const status = result === "PASS" || result === "PASSED" ? "SHORTLISTED" : result === "FAIL" || result === "FAILED" ? "REJECTED" : i.application.status;
    await prisma.application.update({ where: { id: i.applicationId }, data: { status } });
  }
  await interviewWorkflow(id);
  return NextResponse.json(updated);
}
