import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import Link from "next/link";

export default async function AuditPage(){
 const s=await auth();if(!s?.user?.id)redirect("/login");if(s.user.role!=="ADMIN")redirect("/dashboard");
 const [activities,notifications,users]=await Promise.all([
  prisma.crmActivity.findMany({orderBy:{createdAt:"desc"},take:60,include:{company:true,user:{select:{name:true,email:true}}}}),
  prisma.notification.findMany({orderBy:{createdAt:"desc"},take:40,include:{user:{select:{name:true,email:true}}}}),
  prisma.user.findMany({orderBy:{createdAt:"desc"},take:20,select:{id:true,name:true,email:true,role:true,createdAt:true}})
 ]);
 return <main className="content"><div className="topbar"><div><p className="eyebrow">ADMIN</p><h1>Audit & Activity</h1><p className="muted">Recent CRM activity, notification activity and account creation events.</p></div><Link className="secondary" href="/admin/control-center">Control Center</Link></div>
 <div className="audit-grid"><section className="panel"><h2>CRM activities</h2>{activities.map(a=><article className="audit-row" key={a.id}><b>{a.type}</b><div><strong>{a.subject}</strong><span>{a.company.name} · {a.user.name||a.user.email}</span></div><small>{new Date(a.createdAt).toLocaleString()}</small></article>)}{!activities.length&&<div className="empty"><p>No activity.</p></div>}</section>
 <section className="panel"><h2>Recent notifications</h2>{notifications.map(n=><article className="audit-row" key={n.id}><b>NOTIFY</b><div><strong>{n.title}</strong><span>{n.user.name||n.user.email}</span></div><small>{new Date(n.createdAt).toLocaleString()}</small></article>)}{!notifications.length&&<div className="empty"><p>No notifications.</p></div>}</section>
 <section className="panel"><h2>Recent accounts</h2>{users.map(u=><article className="audit-row" key={u.id}><b>{u.role}</b><div><strong>{u.name||"Unnamed"}</strong><span>{u.email}</span></div><small>{new Date(u.createdAt).toLocaleDateString()}</small></article>)}</section></div>
 </main>
}