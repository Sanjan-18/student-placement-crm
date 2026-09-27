import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import Link from "next/link";

export default async function ActivitiesPage(){
 const s=await auth();if(!s?.user?.id)redirect("/login");if(s.user.role==="STUDENT")redirect("/dashboard");
 const activities=await prisma.crmActivity.findMany({orderBy:{createdAt:"desc"},take:100,include:{company:true,user:{select:{name:true,email:true}}}});
 return <main className="content"><div className="topbar"><div><p className="eyebrow">CRM WORKFLOW</p><h1>Activity Timeline</h1><p className="muted">Calls, emails, meetings, notes and follow-ups across companies.</p></div><Link className="secondary" href="/recruiters">Recruiter CRM</Link></div>
 <section className="panel"><div className="timeline">{activities.map(a=><article className="timeline-item" key={a.id}><div className="timeline-dot"/><div className="timeline-body"><div className="timeline-meta"><span className="status-badge status-active">{a.type.replaceAll("_"," ")}</span><span>{new Date(a.createdAt).toLocaleString()}</span></div><h3>{a.subject}</h3><p className="muted"><Link href={`/companies/${a.companyId}`}>{a.company.name}</Link>{a.notes?` — ${a.notes}`:""}</p><div className="timeline-foot"><span>By {a.user?.name||a.user?.email||"Staff"}</span>{a.dueDate&&<span>Follow-up: {new Date(a.dueDate).toLocaleDateString()}</span>}</div></div></article>)}</div>{activities.length===0&&<div className="empty"><h3>No activity yet</h3><p>Open a recruiter/company record to add the first interaction.</p></div>}</section>
 </main>
}