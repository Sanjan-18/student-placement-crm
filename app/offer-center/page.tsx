import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, Gift, IndianRupee, XCircle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import OfferResponseControl from "@/components/offers/OfferResponseControl";

function label(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
function money(value: number | null) { return value == null ? "Not specified" : `₹${value} LPA`; }
function date(value: Date | null) { return value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value) : "Not specified"; }

export default async function OfferCenterPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { student: true } });
  if (!user?.student) redirect("/profile");

  const offers = await prisma.offer.findMany({
    where: { application: { studentId: user.student.id } },
    include: { application: { include: { drive: { include: { company: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  const active = offers.filter(o => ["PENDING", "OFFERED"].includes(o.status));
  const accepted = offers.filter(o => o.status === "ACCEPTED");
  const declined = offers.filter(o => o.status === "DECLINED");
  const highest = offers.reduce<number | null>((max, o) => o.packageLpa != null && (max == null || o.packageLpa > max) ? o.packageLpa : max, null);

  return <WorkspaceShell role={"STUDENT"} active="offer-center" notificationCount={0}>
<header className="topbar page-topbar"><div><p className="eyebrow">OFFER CENTER</p><h1>Your placement offers</h1><p>Review compensation, joining dates and the status of every offer you have received.</p></div><div className="topbar-actions"><Link className="secondary" href="/my-applications">My applications <ArrowUpRight size={15}/></Link><Link className="primary" href="/notifications">Notifications <ArrowUpRight size={15}/></Link></div></header>
      <div className="stats dashboard-kpis offer-center-kpis"><div className="stat stat-accent"><div className="stat-icon"><Gift size={18}/></div><span>Total offers</span><strong>{offers.length}</strong><small>Offers received</small></div><div className="stat"><div className="stat-icon"><Clock3 size={18}/></div><span>Awaiting response</span><strong>{active.length}</strong><small>Offers needing attention</small></div><div className="stat"><div className="stat-icon"><CheckCircle2 size={18}/></div><span>Accepted</span><strong>{accepted.length}</strong><small>Confirmed outcomes</small></div><div className="stat"><div className="stat-icon"><IndianRupee size={18}/></div><span>Highest package</span><strong>{highest == null ? "—" : `₹${highest}`}</strong><small>LPA</small></div></div>
      {!offers.length ? <section className="panel offer-empty"><div className="offer-empty-icon"><Gift size={22}/></div><h2>No placement offers yet</h2><p>When a company offer is created for one of your applications, it will appear here with the package and joining details.</p><Link className="primary" href="/my-applications">View my applications <ArrowUpRight size={15}/></Link></section> : <>
        <section className="offer-center-list">{offers.map(o => { const awaiting = ["PENDING", "OFFERED"].includes(o.status); const acceptedOffer = o.status === "ACCEPTED"; const declinedOffer = o.status === "DECLINED"; return <article className="panel offer-center-card" key={o.id}>
          <div className="offer-center-head"><div className="offer-company-mark">{o.application.drive.company.name.charAt(0).toUpperCase()}</div><div className="offer-company-copy"><p className="eyebrow">{o.application.drive.company.name}</p><h2>{o.application.drive.role}</h2><span>{o.application.drive.location || "Location not specified"}</span></div><span className={`offer-status ${awaiting ? "awaiting" : acceptedOffer ? "accepted" : declinedOffer ? "declined" : ""}`}>{label(o.status)}</span></div>
          <div className="offer-detail-grid"><div><span><IndianRupee size={14}/> Package</span><strong>{money(o.packageLpa)}</strong></div><div><span><CalendarDays size={14}/> Joining date</span><strong>{date(o.joiningDate)}</strong></div><div><span><BriefcaseBusiness size={14}/> Application</span><strong>{label(o.application.status)}</strong></div></div>
          <div className="offer-center-footer"><div className="offer-message">{awaiting ? <><Clock3 size={15}/><span>This offer is awaiting your response.</span></> : acceptedOffer ? <><CheckCircle2 size={15}/><span>You accepted this placement offer.</span></> : declinedOffer ? <><XCircle size={15}/><span>This offer was declined.</span></> : <><Gift size={15}/><span>Offer status: {label(o.status)}.</span></>}</div><div className="offer-center-actions">{awaiting && <OfferResponseControl offerId={o.id}/>}<Link className="secondary" href={`/offers/${o.id}`}>View details <ArrowUpRight size={14}/></Link></div></div>
        </article>})}</section>
        {active.length > 0 && <section className="panel offer-response-note"><div><p className="eyebrow">NEXT STEP</p><h2>Review before responding</h2><p>Open an offer to review its details. You can accept or decline an offer from its detail page while it is awaiting your response.</p></div><div className="offer-response-stats"><span><b>{active.length}</b> awaiting response</span><span><b>{accepted.length}</b> accepted</span><span><b>{declined.length}</b> declined</span></div></section>}
      </>}
</WorkspaceShell>;
}
