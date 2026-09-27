import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {checkEligibility} from "@/lib/eligibility";
import Link from "next/link";

export default async function EligibilityOverview(){
 const s=await auth();if(!s?.user?.id)redirect("/login");
 const drives=await prisma.placementDrive.findMany({where:{status:"ACTIVE"},include:{company:true}});
 const students=await prisma.student.findMany();
 const cards=drives.map(d=>({d,count:students.filter(st=>checkEligibility(st,d).eligible).length}));
 return <main className="content"><div className="topbar"><div><p className="eyebrow">PLACEMENT TOOLS</p><h1>Eligibility Center</h1><p className="muted">See how many students qualify for each active placement drive.</p></div><Link className="secondary" href="/drives">All drives</Link></div><div className="eligibility-drive-grid">{cards.map(x=><Link href={`/drives/${x.d.id}/eligibility`} className="panel eligibility-drive-card" key={x.d.id}><div><span className="muted">{x.d.company.name}</span><h2>{x.d.role}</h2><p>{x.d.location||"Location not specified"}</p></div><div className="eligibility-count"><strong>{x.count}</strong><span>eligible</span></div></Link>)}</div>{!cards.length&&<div className="empty panel"><h3>No active drives</h3><p>Create or activate a placement drive to calculate eligibility.</p></div>}</main>
}