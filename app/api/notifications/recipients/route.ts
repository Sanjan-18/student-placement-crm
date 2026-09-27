import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: { select: { fcmTokens: true } },
    },
    orderBy: { name: "asc" },
    where: { fcmTokens: { some: {} } },
    take: 250,
  });

  return NextResponse.json({ users });
}
