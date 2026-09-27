import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import Link from "next/link";

const stages=["APPLIED","SHORTLISTED","APTITUDE","TECHNICAL","HR","SELECTED","OFFERED","ACCEPTED"];

export default async function Pipeline(){
 const s=await auth();if(!s?.user?.id)redirect("/login");
 const where=s.user.role==="STUDENT"?{student:{userId:s.user.id}}:{};
 const apps=await prisma.application.findMany({where,orderBy:{appliedAt:"desc"},include:{student:{include:{user:true}},drive:{include:{company:true}}}});
 return <main className="content"><div className="topbar"><div><p className="eyebrow">PLACEMENT CRM</p><h1>Candidate Pipeline</h1><p className="muted">Track applications from submission through offer acceptance.</p></div><div className="topbar-actions"><Link className="secondary" href="/applications">Applications</Link><Link className="secondary" href="/interviews/calendar">Interview Schedule</Link></div></div>
 <div className="pipeline-board">{stages.map(stage=>{const rows=apps.filter(a=>a.status===stage);return <section className="pipeline-column" key={stage}><div className="pipeline-column-head"><h2>{stage.replaceAll("_"," ")}</h2><span>{rows.length}</span></div><div className="pipeline-cards">{rows.map(a=><Link className="pipeline-card" href={`/applications/${a.id}`} key={a.id}><strong>{a.student.user.name||a.student.user.email}</strong><span>{a.drive.company.name}</span><small>{a.drive.role}</small><em>{a.drive.packageLpa?`₹${a.drive.packageLpa} LPA`:"Package TBD"}</em></Link>)}</div></section>})}</div>
 </main>
}