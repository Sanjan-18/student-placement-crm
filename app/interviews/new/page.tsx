import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {redirect} from "next/navigation";
import Link from "next/link";

export default async function NewInterviewPage(){
 const session=await auth();if(!session?.user || !["ADMIN","PLACEMENT_OFFICER"].includes(session.user.role))return <main className="content"><h1>Access denied</h1></main>;
 const apps=await prisma.application.findMany({where:{status:{in:["SHORTLISTED","APTITUDE","TECHNICAL","HR"]}},include:{student:{include:{user:true}},drive:{include:{company:true}}},orderBy:{appliedAt:"desc"}});
 async function create(formData:FormData){
  "use server";
  const applicationId=String(formData.get("applicationId")); const round=String(formData.get("round")); const scheduled=String(formData.get("scheduledAt")||""); const mode=String(formData.get("mode")||""); const meetingLink=String(formData.get("meetingLink")||"");
  const a=await prisma.application.findUnique({where:{id:applicationId},include:{student:true,drive:true}});
  if(!a)redirect("/interviews");
  const interview=await prisma.interview.create({data:{applicationId,round,scheduledAt:scheduled?new Date(scheduled):null,mode:mode||null,meetingLink:meetingLink||null}});
  const nextStatus=round.toLowerCase().includes("aptitude")?"APTITUDE":round.toLowerCase().includes("technical")?"TECHNICAL":"HR";
  await prisma.application.update({where:{id:applicationId},data:{status:nextStatus}});
  const user=await prisma.user.findUnique({where:{id:a.student.userId}});
  if(user)await prisma.notification.create({data:{userId:user.id,title:"Interview Scheduled",message:`${round} interview scheduled for ${a.drive.role}.`,type:"INTERVIEW",relatedId:interview.id}});
  redirect("/interviews");
 }
 return <main className="dashboard"><aside className="sidebar"><div className="brand"><div className="logo small">P</div><b>PlacementCRM</b></div><nav><Link className="nav-item" href="/dashboard">Dashboard</Link><Link className="nav-item active" href="/interviews">Interviews</Link></nav></aside>
 <section className="content"><header className="topbar"><div><h1>Schedule Interview</h1><p>Create an interview round for a shortlisted applicant</p></div></header>
 <form action={create} className="form-card"><label>Application<select name="applicationId" required><option value="">Select application</option>{apps.map(a=><option value={a.id} key={a.id}>{a.student.user.name||"Student"} — {a.drive.company.name} — {a.drive.role}</option>)}</select></label>
 <label>Round<select name="round" required><option>Aptitude</option><option>Technical</option><option>HR</option><option>Final</option></select></label>
 <label>Scheduled At<input name="scheduledAt" type="datetime-local" /></label>
 <label>Mode<select name="mode"><option value="">Select mode</option><option>ONLINE</option><option>OFFLINE</option><option>PHONE</option></select></label>
 <label>Meeting Link<input name="meetingLink" placeholder="https://meet.google.com/..." /></label>
 <button className="primary" type="submit">Schedule Interview</button></form></section></main>
}
