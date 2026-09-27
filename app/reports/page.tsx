import Link from "next/link";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export default async function ReportsPage(){
 const session=await auth();if(!session?.user)return null;
 const [students,placed,offers,applications]=await Promise.all([
  prisma.student.count(),prisma.student.count({where:{placementStatus:"PLACED"}}),prisma.offer.count(),prisma.application.count()
 ]);
 return <main className="dashboard"><aside className="sidebar"><div className="brand"><div className="logo small">P</div><b>PlacementCRM</b></div><nav><Link className="nav-item" href="/dashboard">Dashboard</Link><Link className="nav-item active" href="/reports">Reports</Link><Link className="nav-item" href="/analytics">Analytics</Link></nav></aside>
 <section className="content"><header className="topbar"><div><h1>Placement Reports</h1><p>Quick summary for placement operations</p></div></header>
 <div className="panel report-summary"><h2>Current Placement Summary</h2><div className="report-grid"><div><span>Total Students</span><strong>{students}</strong></div><div><span>Placed Students</span><strong>{placed}</strong></div><div><span>Offers</span><strong>{offers}</strong></div><div><span>Applications</span><strong>{applications}</strong></div></div></div>
 <div className="panel"><h2>Placement Rate</h2><div className="big-rate">{students?Math.round(placed/students*100):0}%</div><p className="muted">Calculated as placed students divided by total student profiles.</p></div>
 </section></main>
}
