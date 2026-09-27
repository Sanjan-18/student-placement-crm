import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAcceptSecondOffer, MAX_ACCEPTED_OFFERS } from "@/lib/offer-acceptance";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const status = String(body.status || "").toUpperCase();
  if (!["ACCEPTED", "DECLINED"].includes(status)) {
    return NextResponse.json({ error: "Response must be ACCEPTED or DECLINED" }, { status: 400 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });

  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { application: { include: { student: true, drive: { include: { company: true } } } } },
  });
  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  if (offer.application.studentId !== user.student.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["PENDING", "OFFERED"].includes(offer.status)) return NextResponse.json({ error: "This offer has already been responded to" }, { status: 409 });

  const staffUsers = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "PLACEMENT_OFFICER"] } }, select: { id: true } });

  const result = await prisma.$transaction(async tx => {
    const student = await tx.student.findUnique({ where: { id: user.student!.id } });
    if (!student) throw new Error("Student profile not found");

    // Declining never consumes an acceptance slot and never changes an existing accepted offer.
    if (status === "DECLINED") {
      const next = await tx.offer.update({ where: { id }, data: { status: "DECLINED" } });
      await tx.application.update({ where: { id: offer.applicationId }, data: { status: "REJECTED" } });
      await tx.notification.create({ data: { userId: user.id, title: "Offer Declined", message: `Your response to the ${offer.application.drive.company.name} offer has been recorded.`, type: "OFFER", relatedId: id } });
      if (staffUsers.length) await tx.notification.createMany({ data: staffUsers.map(staff => ({ userId: staff.id, title: "Offer Declined", message: `${user.name || user.email} declined the ${offer.application.drive.company.name} offer.`, type: "OFFER", relatedId: id })) });
      return { next, applicationStatus: "REJECTED", placementStatus: student.placementStatus, acceptedOfferCount: student.acceptedOfferCount };
    }

    if (student.acceptedOfferCount >= MAX_ACCEPTED_OFFERS) {
      const next = await tx.offer.update({ where: { id }, data: { status: "DECLINED" } });
      await tx.application.update({ where: { id: offer.applicationId }, data: { status: "REJECTED" } });
      const msg = `This offer was automatically rejected because the candidate has already reached the maximum of ${MAX_ACCEPTED_OFFERS} accepted offers.`;
      await tx.notification.create({ data: { userId: user.id, title: "Offer Automatically Rejected", message: msg, type: "OFFER", relatedId: id } });
      if (staffUsers.length) await tx.notification.createMany({ data: staffUsers.map(staff => ({ userId: staff.id, title: "Offer Automatically Rejected", message: `${user.name || user.email} reached the maximum of ${MAX_ACCEPTED_OFFERS} accepted offers.`, type: "OFFER", relatedId: id })) });
      return { next, applicationStatus: "REJECTED", placementStatus: student.placementStatus, acceptedOfferCount: student.acceptedOfferCount, ruleRejected: true };
    }

    const accepted = await tx.offer.findMany({
      where: { status: "ACCEPTED", application: { studentId: student.id } },
      include: { application: { include: { drive: true } } },
      orderBy: { createdAt: "desc" },
    });

    if (student.acceptedOfferCount === 1) {
      const previous = accepted[0];
      const previousPackage = previous?.packageLpa;
      if (!previous || !canAcceptSecondOffer(offer.packageLpa, previousPackage)) {
        const next = await tx.offer.update({ where: { id }, data: { status: "DECLINED" } });
        await tx.application.update({ where: { id: offer.applicationId }, data: { status: "REJECTED" } });
        const threshold = previousPackage != null ? `${(previousPackage * 2).toFixed(2)} LPA` : "2× the previous package";
        const msg = `This offer was automatically rejected. A second offer can only be accepted when its package is at least ${threshold}.`;
        await tx.notification.create({ data: { userId: user.id, title: "Offer Automatically Rejected", message: msg, type: "OFFER", relatedId: id } });
        if (staffUsers.length) await tx.notification.createMany({ data: staffUsers.map(staff => ({ userId: staff.id, title: "Offer Automatically Rejected", message: `${user.name || user.email} could not accept the second offer because it did not meet the 2× package rule.`, type: "OFFER", relatedId: id })) });
        return { next, applicationStatus: "REJECTED", placementStatus: student.placementStatus, acceptedOfferCount: student.acceptedOfferCount, ruleRejected: true };
      }

      // The qualifying second offer supersedes the previous accepted offer.
      for (const previous of accepted) {
        await tx.offer.update({ where: { id: previous.id }, data: { status: "REVOKED" } });
        await tx.application.update({ where: { id: previous.applicationId }, data: { status: "REJECTED" } });
        await tx.notification.create({ data: { userId: user.id, title: "Previous Offer Revoked", message: `Your previous accepted offer has been revoked because you accepted a qualifying higher offer.`, type: "OFFER", relatedId: previous.id } });
      }
    }

    const next = await tx.offer.update({ where: { id }, data: { status: "ACCEPTED" } });
    await tx.application.update({ where: { id: offer.applicationId }, data: { status: "ACCEPTED" } });
    const nextCount = student.acceptedOfferCount + 1;
    await tx.student.update({ where: { id: student.id }, data: { acceptedOfferCount: nextCount, placementStatus: "PLACED" } });

    await tx.notification.create({ data: { userId: user.id, title: "Offer Accepted", message: `Your offer from ${offer.application.drive.company.name} has been accepted.`, type: "OFFER", relatedId: id } });
    if (staffUsers.length) await tx.notification.createMany({ data: staffUsers.map(staff => ({ userId: staff.id, title: "Offer Accepted", message: `${user.name || user.email} accepted the ${offer.application.drive.company.name} offer for ${offer.application.drive.role}. The placement records were updated automatically.`, type: "OFFER", relatedId: id })) });

    return { next, applicationStatus: "ACCEPTED", placementStatus: "PLACED", acceptedOfferCount: nextCount, ruleRejected: false };
  });

  return NextResponse.json(result);
}
