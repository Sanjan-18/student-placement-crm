import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import RecruiterPortal from "@/components/recruiter/RecruiterPortal";

export default async function RecruiterPortalPage(){
 const s=await auth(); if(!s?.user?.id)redirect("/login");
 if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))redirect("/dashboard");
 const companies=await prisma.company.findMany({
   orderBy:{name:"asc"},
   include:{drives:{orderBy:{driveDate:"desc"},take:8,include:{applications:{include:{student:{include:{user:true}}}}}}}
 });
 return <main className="content"><div className="topbar"><div><p className="eyebrow">RECRUITER CRM</p><h1>Recruiter Portal</h1><p className="muted">Manage recruiter contacts, active hiring drives and candidate pipelines.</p></div></div><RecruiterPortal companies={companies}/></main>
}