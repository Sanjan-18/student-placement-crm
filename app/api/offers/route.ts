import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isStudent = session.user.role === "STUDENT";

  const dbUser = isStudent
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { student: true },
      })
    : null;

  const offers = await prisma.offer.findMany({
    where:
      isStudent && dbUser?.student
        ? { application: { studentId: dbUser.student.id } }
        : {},
    include: {
      application: {
        include: {
          student: {
            include: {
              user: true,
            },
          },
          drive: {
            include: {
              company: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(offers);
}