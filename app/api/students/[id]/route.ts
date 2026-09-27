import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emailSchema, idSchema, parseJson, placementStatusSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { z } from "zod";

const optionalNumber = (min: number, max: number) => z.union([z.string(), z.number()]).optional().transform(v => {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
});

const studentUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: emailSchema,
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  usn: z.string().trim().max(40).optional().or(z.literal("")),
  department: z.string().trim().max(120).optional().or(z.literal("")),
  graduationYear: optionalNumber(2000, 2100),
  cgpa: optionalNumber(0, 10),
  tenthPercentage: optionalNumber(0, 100),
  twelfthPercentage: optionalNumber(0, 100),
  backlogs: z.union([z.string(), z.number()]).transform(v => Math.max(0, Math.min(100, Number(v) || 0))),
  resumeUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  placementStatus: placementStatusSchema.default("NOT_PLACED"),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsedId = idSchema.safeParse((await params).id);
  if (!parsedId.success) return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
  const student = await prisma.student.findUnique({ where: { id: parsedId.data }, include: { user: true, applications: true } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const idResult = idSchema.safeParse((await params).id);
  if (!idResult.success) return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
  const parsed = parseJson(studentUpdateSchema, await req.json());
  if (!parsed.ok) return NextResponse.json({ error: "Please check the student details.", fields: parsed.error.fieldErrors }, { status: 400 });

  const body = parsed.data;
  const existing = await prisma.student.findUnique({ where: { id: idResult.data }, include: { user: true } });
  if (!existing) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const emailOwner = await prisma.user.findUnique({ where: { email: body.email } });
  if (emailOwner && emailOwner.id !== existing.userId) return NextResponse.json({ error: "That email is already used by another account." }, { status: 409 });
  if (body.usn) {
    const usnOwner = await prisma.student.findUnique({ where: { usn: body.usn } });
    if (usnOwner && usnOwner.id !== existing.id) return NextResponse.json({ error: "That USN is already assigned to another student." }, { status: 409 });
  }

  try {
    const updated = await prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: existing.userId }, data: { name: body.name, email: body.email } });
      return tx.student.update({
        where: { id: existing.id },
        data: {
          phone: body.phone || null,
          usn: body.usn || null,
          department: body.department || null,
          graduationYear: body.graduationYear,
          cgpa: body.cgpa,
          tenthPercentage: body.tenthPercentage,
          twelfthPercentage: body.twelfthPercentage,
          backlogs: body.backlogs,
          resumeUrl: body.resumeUrl || null,
          placementStatus: body.placementStatus,
        },
      });
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Student update failed", error);
    return NextResponse.json({ error: "Could not update student. Please check the details and try again." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = (await params).id;
  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
