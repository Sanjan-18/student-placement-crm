import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import Link from "next/link";

export default async function RecruitersPage(){
 const session=await auth(); if(!session?.user?.id) redirect("/login");
 if(session.user.role==="STUDENT") redirect("/dashboard");
 const recruiters=await prisma.company.findMany({ orderBy:{name:"asc"}, include:{drives:{select:{id:true,role:true,status:true}}} });
 return <main className="content">
  <div className="topbar"><div><p className="eyebrow">RECRUITER CRM</p><h1>Recruiters & Company Contacts</h1><p className="muted">Manage recruiter ownership and communication details for placement drives.</p></div><Link className="secondary" href="/companies">Companies</Link></div>
  <div className="recruiter-grid">{recruiters.map(c=><section className="panel recruiter-card" key={c.id}>
   <div className="recruiter-head"><div className="avatar">{c.name.slice(0,1).toUpperCase()}</div><div><h2>{c.name}</h2><p className="muted">{c.industry||"Industry not specified"}</p></div></div>
   <div className="detail-list compact"><div><span>Recruiter</span><strong>{c.recruiter||"Not assigned"}</strong></div><div><span>Email</span><strong>{c.recruiterEmail||"Not added"}</strong></div><div><span>Location</span><strong>{c.location||"Not specified"}</strong></div><div><span>Active drives</span><strong>{c.drives.filter(d=>d.status==="ACTIVE").length}</strong></div></div>
   <div className="card-actions"><Link className="secondary" href={`/companies/${c.id}`}>View company</Link><Link className="primary" href={`/companies/${c.id}`}>Manage contact</Link></div>
  </section>)}</div>
  {recruiters.length===0&&<div className="empty panel"><h3>No companies yet</h3><p>Create a company first to start managing recruiter contacts.</p></div>}
 </main>
}