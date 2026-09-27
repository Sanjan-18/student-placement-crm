import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import CandidatePipeline from "@/components/recruiter/CandidatePipeline";

export default async function RecruiterCandidates({searchParams}:{searchParams:Promise<{companyId?:string}>}){
 const s=await auth();if(!s?.user?.id)redirect("/login");if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))redirect("/dashboard");
 const sp=await searchParams; const companies=await prisma.company.findMany({orderBy:{name:"asc"},select:{id:true,name:true}});
 const companyId=sp.companyId||companies[0]?.id;
 const applications=companyId?await prisma.application.findMany({where:{drive:{companyId}},orderBy:{appliedAt:"desc"},include:{student:{include:{user:true}},drive:{include:{company:true}},offer:true}}):[];
 return <main className="content"><div className="topbar"><div><p className="eyebrow">CANDIDATE CRM</p><h1>Candidate Pipeline</h1><p className="muted">Track candidates across every placement stage.</p></div></div><div className="panel"><form className="filter-bar"><label>Company<select name="companyId" defaultValue={companyId}><option value="">Select company</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button className="primary">Load Pipeline</button></form></div>{companyId&&<CandidatePipeline applications={applications}/>}</main>
}