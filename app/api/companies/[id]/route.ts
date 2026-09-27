import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const staff = ["ADMIN", "PLACEMENT_OFFICER"];
function clean(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function validEmail(value: string) { return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function validWebsite(value: string) { if (!value) return true; try { new URL(value); return true; } catch { return false; } }

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id }, include: { _count: { select: { drives: true, crmActivities: true } } } });
  if (!company) return NextResponse.json({ error: "Company not found." }, { status: 404 });
  return NextResponse.json(company);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !staff.includes(session.user.role)) return NextResponse.json({ error: "Only admin or placement officers can edit companies." }, { status: 403 });
  const { id } = await params;
  try {
    const body = await req.json();
    const name = clean(body.name);
    const industry = clean(body.industry);
    const website = clean(body.website);
    const location = clean(body.location);
    const recruiter = clean(body.recruiter);
    const recruiterEmail = clean(body.recruiterEmail);
    const description = clean(body.description);
    if (!name) return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    if (name.length > 120) return NextResponse.json({ error: "Company name must be 120 characters or less." }, { status: 400 });
    if (!validEmail(recruiterEmail)) return NextResponse.json({ error: "Enter a valid recruiter email." }, { status: 400 });
    if (!validWebsite(website)) return NextResponse.json({ error: "Enter a valid website URL, including https://." }, { status: 400 });

    const existing = await prisma.company.findFirst({ where: { name: { equals: name, mode: "insensitive" }, NOT: { id } }, select: { name: true } });
    if (existing) return NextResponse.json({ error: `A company named "${existing.name}" already exists.` }, { status: 409 });

    const company = await prisma.company.update({ where: { id }, data: { name, industry: industry || null, website: website || null, location: location || null, recruiter: recruiter || null, recruiterEmail: recruiterEmail || null, description: description || null } });
    return NextResponse.json(company);
  } catch (e: any) {
    console.error(e);
    if (e?.code === "P2025") return NextResponse.json({ error: "Company not found." }, { status: 404 });
    return NextResponse.json({ error: "Could not update company." }, { status: 500 });
  }
}
