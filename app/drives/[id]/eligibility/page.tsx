import {auth} from "@/auth";
import {redirect,notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {checkEligibility} from "@/lib/eligibility";
import Link from "next/link";
import EligibilityTable from "@/components/eligibility/EligibilityTable";
import EligibilityReasons from "@/components/eligibility/EligibilityReasons";

export default async function DriveEligibility({params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user?.id)redirect("/login");
 if(s.user.role==="STUDENT")redirect("/dashboard");
 const {id}=await params;
 const drive=await prisma.placementDrive.findUnique({where:{id},include:{company:true}});
 if(!drive)notFound();
 const students=await prisma.student.findMany({include:{user:true}});
 const results=students.map(st=>({student:st,result:checkEligibility(st,drive)}));
 const eligible=results.filter(x=>x.result.eligible).map(x=>({...x.student,reasons:x.result.reasons}));
 const ineligible=results.filter(x=>!x.result.eligible);
 return <main className="content"><div className="topbar"><div><p className="eyebrow">ELIGIBILITY</p><h1>{drive.role} — Eligible Students</h1><p className="muted">{drive.company.name} · Recruiter-ready eligibility list</p></div><div className="topbar-actions"><Link className="secondary" href={`/drives/${id}`}>Drive details</Link><Link className="secondary" href="/students">Students</Link></div></div>
 <div className="eligibility-kpis"><div className="panel"><strong>{students.length}</strong><span>Total students</span></div><div className="panel"><strong>{eligible.length}</strong><span>Eligible</span></div><div className="panel"><strong>{ineligible.length}</strong><span>Not eligible</span></div><div className="panel"><strong>{students.length?Math.round(eligible.length/students.length*100):0}%</strong><span>Eligibility rate</span></div></div>
 <section className="panel"><h2>Eligible students</h2><EligibilityTable rows={eligible}/></section>
 <section className="panel"><h2>Eligibility rules</h2><div className="rule-grid"><div><b>Minimum CGPA</b><span>{drive.minCgpa??"No minimum"}</span></div><div><b>Maximum backlogs</b><span>{drive.maxBacklogs??"No limit"}</span></div><div><b>Graduation year</b><span>{drive.graduationYear??"Any"}</span></div><div><b>Departments</b><span>{drive.allowedDepartments||"All departments"}</span></div></div></section>
 <section className="panel"><h2>Why students are not eligible</h2><div className="ineligible-grid">{ineligible.slice(0,30).map(x=><article className="ineligible-card" key={x.student.id}><strong>{x.student.user.name||x.student.user.email}</strong><span>{x.student.department||"Department not set"}</span><EligibilityReasons reasons={x.result.reasons}/></article>)}</div>{ineligible.length>30&&<p className="muted">Showing first 30 ineligible students.</p>}</section>
 </main>
}