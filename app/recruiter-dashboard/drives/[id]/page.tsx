import {auth} from "@/auth";
import {redirect,notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import Link from "next/link";
import RecruiterCandidateTable from "@/components/recruiter/RecruiterCandidateTable";

export default async function RecruiterDrive({params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user?.id)redirect("/login");if(s.user.role==="STUDENT")redirect("/dashboard");
 const {id}=await params;
 const drive=await prisma.placementDrive.findUnique({where:{id},include:{company:true,applications:{orderBy:{appliedAt:"desc"},include:{student:{include:{user:true,documents:true}},interviews:true,offer:true}}}});
 if(!drive)notFound();
 return <main className="content"><div className="topbar"><div><p className="eyebrow">DRIVE MANAGEMENT</p><h1>{drive.role}</h1><p className="muted">{drive.company.name} · {drive.location||"Location not specified"}</p></div><div className="topbar-actions"><Link className="secondary" href="/recruiter-dashboard">Back to dashboard</Link><Link className="secondary" href={`/drives/${id}/eligibility`}>Eligible Students</Link></div></div>
 <section className="panel"><div className="drive-management-head"><div><h2>Candidate applications</h2><p className="muted">Review profiles, resumes and application status.</p></div><span className="status-badge status-active">{drive.applications.length} applicants</span></div><RecruiterCandidateTable applications={drive.applications}/></section>
 </main>
}