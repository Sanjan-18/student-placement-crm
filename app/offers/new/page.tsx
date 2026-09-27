import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OfferCreateForm, { type OfferCandidate } from "@/components/offers/OfferCreateForm";

export default async function NewOfferPage() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "PLACEMENT_OFFICER"].includes(session.user.role)) {
    return <main className="content"><h1>Access denied</h1></main>;
  }

  const applications = await prisma.application.findMany({
    where: { status: "OFFERED", offer: null },
    include: {
      student: { include: { user: true } },
      drive: { include: { company: true } },
    },
    orderBy: { appliedAt: "desc" },
  });

  const candidates: OfferCandidate[] = applications.map((application) => ({
    id: application.id,
    studentName: application.student.user.name || "Student",
    usn: application.student.usn,
    email: application.student.user.email,
    company: application.drive.company.name,
    role: application.drive.role,
    packageLpa: application.drive.packageLpa,
    location: application.drive.location,
  }));

  async function create(formData: FormData) {
    "use server";

    const applicationId = String(formData.get("applicationId") || "");
    const joining = String(formData.get("joiningDate") || "");

    if (!applicationId) redirect("/offers/new");

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { student: true, drive: { include: { company: true } } },
    });

    if (!application || application.status !== "OFFERED") redirect("/offers/new");

    const existing = await prisma.offer.findUnique({ where: { applicationId } });
    if (existing) redirect(`/offers/${existing.id}`);

    const offer = await prisma.offer.create({
      data: {
        applicationId,
        packageLpa: application.drive.packageLpa,
        joiningDate: joining ? new Date(joining) : null,
        status: "OFFERED",
      },
    });

    const user = await prisma.user.findUnique({ where: { id: application.student.userId } });
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Placement Offer Received",
          message: `You received an offer from ${application.drive.company.name} for ${application.drive.role}.`,
          type: "OFFER",
          relatedId: offer.id,
        },
      });
    }

    redirect("/offers");
  }

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand"><div className="logo small">P</div><b>PlacementCRM</b></div>
        <nav>
          <Link className="nav-item" href="/dashboard">Dashboard</Link>
          <Link className="nav-item active" href="/offers">Offers</Link>
        </nav>
      </aside>
      <section className="content">
        <header className="topbar">
          <div>
            <h1>Create Offer</h1>
            <p>Select a candidate already marked as OFFERED. Company, role and package are filled automatically.</p>
          </div>
          <Link className="secondary" href="/offers">Back to Offers</Link>
        </header>
        <OfferCreateForm candidates={candidates} action={create} />
      </section>
    </main>
  );
}
