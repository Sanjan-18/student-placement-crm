import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import Link from "next/link";

export default async function RemindersPage(){
 const s=await auth();if(!s?.user?.id)redirect("/login");
 const now=new Date(),soon=new Date(now.getTime()+7*24*60*60*1000);
 const interviews=await prisma.interview.findMany({where:s.user.role==="STUDENT"?{scheduledAt:{gte:now,lte:soon},application:{student:{userId:s.user.id}}}:{scheduledAt:{gte:now,lte:soon}},orderBy:{scheduledAt:"asc"},include:{application:{include:{student:{include:{user:true}},drive:{include:{company:true}}}}}});
 const deadlines=await prisma.placementDrive.findMany({where:{applicationDeadline:{gte:now,lte:soon},status:"ACTIVE"},orderBy:{applicationDeadline:"asc"},include:{company:true}});
 return <main className="content"><div className="topbar"><div><p className="eyebrow">REMINDERS</p><h1>Upcoming Deadlines & Interviews</h1><p className="muted">The next 7 days of placement activity.</p></div><Link className="secondary" href="/notifications">Notification Center</Link></div>
 <div className="reminder-page-grid"><section className="panel"><h2>Interviews</h2>{interviews.map(i=><Link className="reminder-card" href={`/interviews/${i.id}`} key={i.id}><strong>{i.round} — {i.application.drive.company.name}</strong><span>{i.application.drive.role}</span><small>{new Date(i.scheduledAt).toLocaleString()}</small></Link>)}{!interviews.length&&<div className="empty"><p>No interviews in the next 7 days.</p></div>}</section>
 <section className="panel"><h2>Application deadlines</h2>{deadlines.map(d=><Link className="reminder-card" href={`/drives/${d.id}`} key={d.id}><strong>{d.company.name}</strong><span>{d.role}</span><small>Deadline: {new Date(d.applicationDeadline).toLocaleString()}</small></Link>)}{!deadlines.length&&<div className="empty"><p>No active deadlines in the next 7 days.</p></div>}</section></div>
 </main>
}