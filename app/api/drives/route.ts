import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const staff = ["ADMIN", "PLACEMENT_OFFICER"];
const num = (v: unknown) => v === "" || v == null ? null : Number(v);
const clean = (v: unknown) => typeof v === "string" ? v.trim() : "";
function parsedDate(v: unknown) { if (!v) return null; const d = new Date(String(v)); return Number.isNaN(d.getTime()) ? undefined : d; }
function validate(body: any) {
  const role = clean(body.role); const companyId = clean(body.companyId); const driveDate = parsedDate(body.driveDate); const deadline = parsedDate(body.applicationDeadline);
  if (!companyId || !role) return "Company and job role are required.";
  if (role.length > 120) return "Job role must be 120 characters or less.";
  if (driveDate === undefined || deadline === undefined) return "Enter valid drive and deadline dates.";
  if (driveDate && deadline && deadline < driveDate) return "Application deadline cannot be before the drive date.";
  const packageLpa = num(body.packageLpa), minCgpa = num(body.minCgpa), maxBacklogs = num(body.maxBacklogs), graduationYear = num(body.graduationYear);
  if (packageLpa != null && (!Number.isFinite(packageLpa) || packageLpa < 0)) return "Package must be a valid non-negative number.";
  if (minCgpa != null && (!Number.isFinite(minCgpa) || minCgpa < 0 || minCgpa > 10)) return "Minimum CGPA must be between 0 and 10.";
  if (maxBacklogs != null && (!Number.isInteger(maxBacklogs) || maxBacklogs < 0)) return "Maximum backlogs must be a non-negative whole number.";
  if (graduationYear != null && (!Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > 2100)) return "Graduation year must be between 2000 and 2100.";
  return null;
}
function data(body: any) { return { companyId: clean(body.companyId), role: clean(body.role), description: clean(body.description) || null, location: clean(body.location) || null, packageLpa: num(body.packageLpa), driveDate: parsedDate(body.driveDate) || null, applicationDeadline: parsedDate(body.applicationDeadline) || null, minCgpa: num(body.minCgpa) ?? 0, allowedDepartments: clean(body.allowedDepartments) || null, graduationYear: num(body.graduationYear), maxBacklogs: num(body.maxBacklogs) ?? 0 }; }

export async function GET() { const s = await auth(); if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.json(await prisma.placementDrive.findMany({ include: { company: true, _count: { select: { applications: true } } }, orderBy: { createdAt: "desc" } })); }

export async function POST(req: Request) {
  const s = await auth(); if (!s?.user || !staff.includes(s.user.role)) return NextResponse.json({ error: "Only admin or placement officers can create drives." }, { status: 403 });
  try { const body = await req.json(); const error = validate(body); if (error) return NextResponse.json({ error }, { status: 400 }); const company = await prisma.company.findUnique({ where: { id: clean(body.companyId) }, select: { id: true } }); if (!company) return NextResponse.json({ error: "Selected company was not found." }, { status: 400 }); const drive = await prisma.placementDrive.create({ data: { ...data(body), status: "ACTIVE" } }); return NextResponse.json(drive, { status: 201 }); } catch (e) { console.error(e); return NextResponse.json({ error: "Could not create placement drive." }, { status: 500 }); }
}
