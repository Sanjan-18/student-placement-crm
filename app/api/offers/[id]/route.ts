import { offerWorkflow } from "@/lib/workflows";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const old = await prisma.offer.findUnique({ where: { id }, include: { application: { include: { student: true, drive: { include: { company: true } } } } } });
  if (!old) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  const data: Record<string, unknown> = {};
  if (body.packageLpa !== undefined) data.packageLpa = body.packageLpa === null ? null : Number(body.packageLpa);
  if (body.joiningDate !== undefined) data.joiningDate = body.joiningDate ? new Date(body.joiningDate) : null;
  if (body.status !== undefined) {
    const requestedStatus = String(body.status).toUpperCase();
    if (["ACCEPTED", "DECLINED", "REVOKED"].includes(requestedStatus)) {
      return NextResponse.json({ error: "Offer acceptance/decline is controlled by the student. Use the student Offer Center response workflow." }, { status: 403 });
    }
    data.status = requestedStatus;
  }
  const offer = await prisma.offer.update({ where: { id }, data });
  if (body.status) {
    const status = String(body.status).toUpperCase();
    const appStatus = status === "ACCEPTED" ? "ACCEPTED" : status === "DECLINED" ? "REJECTED" : "OFFERED";
    const placement = status === "ACCEPTED" ? "PLACED" : status === "DECLINED" ? "NOT_PLACED" : "PLACED";
    await prisma.application.update({ where: { id: old.applicationId }, data: { status: appStatus } });
    await prisma.student.update({ where: { id: old.application.studentId }, data: { placementStatus: placement } });
    const user = await prisma.user.findUnique({ where: { id: old.application.student.userId } });
    if (user) await prisma.notification.create({ data: { userId: user.id, title: `Offer ${status.charAt(0) + status.slice(1).toLowerCase()}`, message: `Your offer from ${old.application.drive.company.name} is now ${status.toLowerCase()}.`, type: "OFFER", relatedId: id } });
  }
  await offerWorkflow(id);
  return NextResponse.json(offer);
}
