import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import Link from "next/link";

export default async function InterviewCalendar(){
 const s=await auth();if(!s?.user?.id)redirect("/login");
 const where=s.user.role==="STUDENT"?{application:{student:{userId:s.user.id}}}:{};
 const interviews=await prisma.interview.findMany({ where, orderBy:{scheduledAt:"asc"}, include:{ application:{ include:{ student:{include:{user:true}}, drive:{include:{company:true}} } } } });
 const upcoming=interviews.filter(i=>new Date(i.scheduledAt)>=new Date());
 const past=interviews.filter(i=>new Date(i.scheduledAt)<new Date());
 return <main className="content"><div className="topbar"><div><p className="eyebrow">INTERVIEW PIPELINE</p><h1>Interview Schedule</h1><p className="muted">Upcoming and completed interview rounds across placement drives.</p></div><div className="topbar-actions">{s.user.role!=="STUDENT"&&<Link className="primary" href="/interviews/new">Schedule Interview</Link>}<Link className="secondary" href="/interviews">All Interviews</Link></div></div>
 <section className="calendar-summary"><div className="panel"><strong>{upcoming.length}</strong><span>Upcoming</span></div><div className="panel"><strong>{past.length}</strong><span>Completed dates</span></div><div className="panel"><strong>{interviews.length}</strong><span>Total rounds</span></div></section>
 <section className="panel"><h2>Upcoming interviews</h2><div className="interview-calendar-list">{upcoming.map(i=><InterviewRow key={i.id} i={i}/>)}</div>{upcoming.length===0&&<div className="empty"><p>No upcoming interviews scheduled.</p></div>}</section>
 <section className="panel"><h2>Previous interviews</h2><div className="interview-calendar-list">{past.map(i=><InterviewRow key={i.id} i={i} past/>)}</div>{past.length===0&&<div className="empty"><p>No previous interviews.</p></div>}</section>
 </main>
}

function InterviewRow({i,past=false}:{i:any;past?:boolean}){
 return <Link href={`/interviews/${i.id}`} className="interview-row"><div className="date-box"><b>{new Date(i.scheduledAt).toLocaleDateString("en-US",{day:"2-digit"})}</b><span>{new Date(i.scheduledAt).toLocaleDateString("en-US",{month:"short"})}</span></div><div className="interview-info"><div className="interview-title"><strong>{i.round} Round</strong><span className="status-badge status-active">{i.mode}</span></div><span>{i.application.student.user.name||i.application.student.user.email} · {i.application.drive.role} · {i.application.drive.company.name}</span><small>{new Date(i.scheduledAt).toLocaleString()}</small></div><span className="chevron">›</span></Link>
}