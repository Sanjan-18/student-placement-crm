import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {notFound} from "next/navigation";
import Link from "next/link";
import OfferResponseControl from "@/components/offers/OfferResponseControl";

export default async function OfferDetails({params}:{params:Promise<{id:string}>}){
 const session=await auth();if(!session?.user)return null;
 const {id}=await params;
 const o=await prisma.offer.findUnique({ where:{id}, include:{ application:{ include:{ student:{include:{user:true}}, drive:{include:{company:true}} } } } });
 if(!o)notFound();
 const isStudent = session.user.role === "STUDENT";
 if(isStudent && o.application.student.userId !== session.user.id) return notFound();
 return <main className="dashboard"><aside className="sidebar"><div className="brand"><div className="logo small">P</div><b>PlacementCRM</b></div><nav><Link className="nav-item" href="/dashboard">Dashboard</Link><Link className="nav-item" href="/offers">Offers</Link></nav></aside>
 <section className="content"><header className="topbar page-topbar"><div><h1>Placement Offer</h1><p>{o.application.drive.company.name} — {o.application.drive.role}</p></div><Link className="secondary" href="/offers">← Offers</Link></header>
 <div className="profile-grid"><div className="panel"><h2>Offer Details</h2>
 {[["Student",o.application.student.user.name],["Company",o.application.drive.company.name],["Role",o.application.drive.role],["Package",o.packageLpa?`₹${o.packageLpa} LPA`:"—"],["Joining Date",o.joiningDate?.toLocaleDateString()||"—"],["Status",o.status]].map(([l,v])=><div className="detail" key={l}><span>{l}</span><strong>{v||"—"}</strong></div>)}
 </div><div className="panel"><h2>Placement</h2><div className="detail"><span>Student placement status</span><strong>{o.application.student.placementStatus}</strong></div><div className="detail"><span>Application status</span><strong>{o.application.status}</strong></div></div></div>{isStudent && ["PENDING","OFFERED"].includes(o.status) && <section className="panel offer-detail-response"><div><p className="eyebrow">YOUR RESPONSE</p><h2>Respond to this offer</h2><p>Choose whether you want to accept or decline this placement offer.</p></div><OfferResponseControl offerId={o.id}/></section>}</section></main>
}
