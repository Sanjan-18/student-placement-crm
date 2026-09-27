import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emailSchema, parseJson, placementStatusSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { z } from "zod";

const optionalNumber = (min: number, max: number) => z.union([z.string(), z.number()]).optional().transform(v => {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
});

const createStudentSchema = z.object({
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

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const students = await prisma.student.findMany({ include: { user: true }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = parseJson(createStudentSchema, await req.json());
  if (!parsed.ok) return NextResponse.json({ error: "Please check the student details.", fields: parsed.error.fieldErrors }, { status: 400 });
  const body = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing && existing.role !== "STUDENT") return NextResponse.json({ error: "That email belongs to a non-student account." }, { status: 409 });
    if (body.usn) {
      const existingUsn = await prisma.student.findUnique({ where: { usn: body.usn } });
      if (existingUsn) return NextResponse.json({ error: "That USN is already assigned to another student." }, { status: 409 });
    }

    const user = existing
      ? await prisma.user.update({ where: { id: existing.id }, data: { name: body.name } })
      : await prisma.user.create({ data: { name: body.name, email: body.email, role: "STUDENT", student: { create: {} } } });

    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {
        phone: body.phone || null, usn: body.usn || null, department: body.department || null,
        graduationYear: body.graduationYear, cgpa: body.cgpa, tenthPercentage: body.tenthPercentage,
        twelfthPercentage: body.twelfthPercentage, backlogs: body.backlogs, resumeUrl: body.resumeUrl || null,
        placementStatus: body.placementStatus,
      },
      create: {
        userId: user.id, phone: body.phone || null, usn: body.usn || null, department: body.department || null,
        graduationYear: body.graduationYear, cgpa: body.cgpa, tenthPercentage: body.tenthPercentage,
        twelfthPercentage: body.twelfthPercentage, backlogs: body.backlogs, resumeUrl: body.resumeUrl || null,
        placementStatus: body.placementStatus,
      },
    });
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Student creation failed", error);
    return NextResponse.json({ error: "Could not create student. Please check the details and try again." }, { status: 500 });
  }
}
