import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, FileText, UserRound } from "lucide-react";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import OpportunityFilters from "@/components/opportunities/OpportunityFilters";

export default async function OpportunitiesPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) redirect("/profile");

  const [drives, savedDrives, currentAcceptedOffer] = await Promise.all([
    prisma.placementDrive.findMany({
    where: { status: "ACTIVE", OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: new Date() } }] },
    include: { company: true, applications: { where: { studentId: user.student.id }, select: { id: true, status: true } } },
    orderBy: [{ applicationDeadline: "asc" }, { driveDate: "asc" }],
    }),
    prisma.savedDrive.findMany({ where: { studentId: user.student.id }, select: { id: true, driveId: true } }),
    prisma.offer.findFirst({ where: { application: { studentId: user.student.id }, status: "ACCEPTED" }, orderBy: { createdAt: "desc" }, select: { packageLpa: true } }),
  ]);
  const savedByDrive = new Map(savedDrives.map(saved => [saved.driveId, saved.id]));

  const opportunities = drives.map(drive => {
    const eligibility = checkEligibility(user.student!, drive, currentAcceptedOffer?.packageLpa);
    const application = drive.applications[0];
    return {
      id: drive.id,
      company: drive.company.name,
      role: drive.role,
      location: drive.location || "",
      packageLpa: drive.packageLpa,
      deadline: drive.applicationDeadline?.toISOString() || null,
      driveDate: drive.driveDate?.toISOString() || null,
      eligible: eligibility.eligible,
      reasons: eligibility.reasons,
      applied: Boolean(application),
      applicationStatus: application?.status || null,
      savedId: savedByDrive.get(drive.id) || null,
      departments: drive.allowedDepartments || "All departments",
    };
  });

  const eligibleCount = opportunities.filter(x => x.eligible).length;
  const appliedCount = opportunities.filter(x => x.applied).length;
  const profileFields = [user.name, user.student.phone, user.student.usn, user.student.department, user.student.graduationYear, user.student.cgpa, user.student.resumeUrl];
  const profileCompleteness = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  return <WorkspaceShell role={"STUDENT"} active="opportunities" notificationCount={0}>

      <header className="topbar page-topbar">
        <div><p className="eyebrow">OPPORTUNITY CENTER</p><h1>Find your next placement</h1><p>Explore active drives, check your eligibility and track applications from one place.</p></div>
        <div className="topbar-actions"><Link className="secondary" href="/saved-opportunities">Saved opportunities <ArrowUpRight size={15}/></Link><Link className="secondary" href="/profile">My profile <ArrowUpRight size={15}/></Link></div>
      </header>

      <div className="stats dashboard-kpis">
        <div className="stat stat-accent"><div className="stat-icon"><BriefcaseBusiness size={18}/></div><span>Active opportunities</span><strong>{opportunities.length}</strong><small>Currently open drives</small></div>
        <div className="stat"><div className="stat-icon"><CheckCircle2 size={18}/></div><span>Eligible for you</span><strong>{eligibleCount}</strong><small>Based on your profile</small></div>
        <div className="stat"><div className="stat-icon"><FileText size={18}/></div><span>Already applied</span><strong>{appliedCount}</strong><small>Applications in these drives</small></div>
        <div className="stat"><div className="stat-icon"><UserRound size={18}/></div><span>Profile completeness</span><strong>{profileCompleteness}%</strong><small>{profileCompleteness < 100 ? "Complete your profile" : "Profile is complete"}</small></div>
      </div>

      {profileCompleteness < 100 && <div className="panel opportunity-profile-alert"><div><strong>Complete your profile before applying</strong><p>A complete academic profile and resume make eligibility checks more reliable.</p></div><Link className="primary" href="/profile/edit">Complete profile</Link></div>}
      <OpportunityFilters opportunities={opportunities}/>
</WorkspaceShell>;
}
