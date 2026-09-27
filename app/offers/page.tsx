import Link from "next/link";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export default async function OffersPage(){
 const session=await auth(); if(!session?.user)return null;
 const isStudent=session.user.role==="STUDENT";
 const student=isStudent?await prisma.student.findUnique({where:{userId:session.user.id}}):null;
 const offers=await prisma.offer.findMany({where:isStudent&&student?{application:{studentId:student.id}}:{},include:{application:{include:{student:{include:{user:true}},drive:{include:{company:true}}}}},orderBy:{createdAt:"desc"}});
 return <WorkspaceShell role={session.user.role} active="offers">
 <section className="legacy-page-content"><header className="topbar"><div><h1>{isStudent ? "My Offers" : "Offers"}</h1><p>{isStudent ? "Review your placement offers and joining details" : "Track placement offers and joining details"}</p></div>{["ADMIN","PLACEMENT_OFFICER"].includes(session.user.role)&&<Link className="primary" href="/offers/new">+ Create Offer</Link>}</header>
 <div className="panel table-panel"><div className="table-head offer-head"><span>Student</span><span>Company</span><span>Role</span><span>Package</span><span>Joining</span><span>Status</span></div>
 {offers.length===0?<div className="empty">No offers created yet.</div>:offers.map(o=><Link className="table-row offer-row" href={`/offers/${o.id}`} key={o.id}>
 <span><strong>{o.application.student.user.name||"Student"}</strong><small>{o.application.student.usn||o.application.student.user.email}</small></span><span>{o.application.drive.company.name}</span><span>{o.application.drive.role}</span><span>{o.packageLpa?`₹${o.packageLpa} LPA`:"—"}</span><span>{o.joiningDate?.toLocaleDateString()||"—"}</span><span><b className="status">{o.status}</b></span>
 </Link>)}</div></section>
 </WorkspaceShell>
}
