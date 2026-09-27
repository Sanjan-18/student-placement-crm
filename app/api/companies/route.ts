import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const staff = ["ADMIN", "PLACEMENT_OFFICER"];

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validWebsite(value: string) {
  if (!value) return true;
  try { new URL(value); return true; } catch { return false; }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companies = await prisma.company.findMany({
    include: { _count: { select: { drives: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !staff.includes(session.user.role)) {
    return NextResponse.json({ error: "Only admin or placement officers can add companies." }, { status: 403 });
  }

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

    const duplicate = await prisma.company.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true, name: true },
    });
    if (duplicate) return NextResponse.json({ error: `A company named "${duplicate.name}" already exists.` }, { status: 409 });

    const company = await prisma.company.create({
      data: { name, industry: industry || null, website: website || null, location: location || null, recruiter: recruiter || null, recruiterEmail: recruiterEmail || null, description: description || null },
    });
    return NextResponse.json(company, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create company." }, { status: 500 });
  }
}
