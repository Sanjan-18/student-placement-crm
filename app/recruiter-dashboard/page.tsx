import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import Link from "next/link";

export default async function RecruiterDashboard(){
 const s=await auth();if(!s?.user?.id)redirect("/login");
 if(s.user.role==="STUDENT")redirect("/dashboard");
 const drives=await prisma.placementDrive.findMany({where:{status:"ACTIVE"},include:{company:true,applications:{include:{student:{include:{user:true}}}}},orderBy:{driveDate:"asc"}});
 const stats=drives.reduce((a,d)=>{a.drives++;a.applications+=d.applications.length;a.shortlisted+=d.applications.filter(x=>["SHORTLISTED","APTITUDE","TECHNICAL","HR","SELECTED","OFFERED","ACCEPTED"].includes(x.status)).length;return a},{drives:0,applications:0,shortlisted:0});
 return <main className="content"><div className="topbar"><div><p className="eyebrow">RECRUITER WORKSPACE</p><h1>Placement Officer Dashboard</h1><p className="muted">Shortlist candidates, review resumes and move applications through the hiring pipeline.</p></div><div className="topbar-actions"><Link className="primary" href="/drives/new">Create Drive</Link><Link className="secondary" href="/eligibility">Eligibility Center</Link></div></div>
 <div className="recruiter-kpis"><div className="panel"><strong>{stats.drives}</strong><span>Active drives</span></div><div className="panel"><strong>{stats.applications}</strong><span>Applications</span></div><div className="panel"><strong>{stats.shortlisted}</strong><span>In pipeline</span></div></div>
 <div className="officer-drive-grid">{drives.map(d=><section className="panel officer-drive" key={d.id}><div className="officer-drive-head"><div><span className="muted">{d.company.name}</span><h2>{d.role}</h2></div><Link className="secondary" href={`/recruiter-dashboard/drives/${d.id}`}>Manage</Link></div><div className="officer-drive-stats"><span><b>{d.applications.length}</b> applicants</span><span><b>{d.applications.filter(x=>["SHORTLISTED","APTITUDE","TECHNICAL","HR","SELECTED","OFFERED","ACCEPTED"].includes(x.status)).length}</b> shortlisted/pipeline</span><span><b>{d.applications.filter(x=>x.status==="OFFERED"||x.status==="ACCEPTED").length}</b> offers</span></div><div className="officer-drive-foot"><span>Deadline: {d.applicationDeadline?new Date(d.applicationDeadline).toLocaleDateString():"Not set"}</span><Link href={`/drives/${d.id}/eligibility`}>View eligible students →</Link></div></section>)}</div>
 </main>
}