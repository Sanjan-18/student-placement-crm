import {auth} from "@/auth";
import {redirect,notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import Link from "next/link";
import RecruiterEditor from "@/components/recruiters/RecruiterEditor";
import ActivityForm from "@/components/activities/ActivityForm";
import ActivityTimeline from "@/components/activities/ActivityTimeline";

export default async function RecruiterDetail({params}:{params:Promise<{id:string}>}){
 const session=await auth(); if(!session?.user?.id) redirect("/login");
 if(session.user.role==="STUDENT") redirect("/dashboard");
 const {id}=await params;
 const company=await prisma.company.findUnique({where:{id},include:{drives:{orderBy:{driveDate:"desc"}}}});
 if(!company) notFound();
 return <main className="content"><div className="topbar"><div><p className="eyebrow">RECRUITER</p><h1>{company.name}</h1><p className="muted">Recruiter contact and drive ownership.</p></div><Link className="secondary" href="/recruiters">Back to recruiters</Link></div>
 <div className="recruiter-detail-grid"><section className="panel"><h2>Contact details</h2><RecruiterEditor company={company}/></section>
 <section className="panel"><h2>Placement drives</h2><div className="mini-list">{company.drives.map(d=><Link key={d.id} href={`/drives/${d.id}`} className="mini-row"><div><strong>{d.role}</strong><span>{d.driveDate?new Date(d.driveDate).toLocaleDateString():"Date not set"}</span></div><span className={`status-badge status-${d.status.toLowerCase()}`}>{d.status}</span></Link>)}</div>{company.drives.length===0&&<p className="muted">No drives linked to this company.</p>}</section></div>
 <div className="recruiter-detail-grid activity-sections"><section className="panel"><h2>Add CRM activity</h2><ActivityForm companyId={company.id}/></section><section className="panel"><h2>Activity history</h2><ActivityTimeline companyId={company.id}/></section></div>
 </main>
}