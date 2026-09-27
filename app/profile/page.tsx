import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import Link from "next/link";
import WorkspaceShell from "@/components/layout/WorkspaceShell";

function initials(name?: string | null) {
  return (name || "Student").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default async function ProfilePage(){
 const session=await auth();
 if(!session?.user?.id) redirect("/login");
 const student=await prisma.student.findUnique({where:{userId:session.user.id},include:{user:true}});
 if(!student) redirect("/dashboard");
 const fields=[student.phone,student.usn,student.department,student.graduationYear,student.cgpa,student.tenthPercentage,student.twelfthPercentage,student.resumeUrl];
 const complete=Math.round(fields.filter(v=>v!==null&&v!==undefined&&String(v).trim()!=="").length/fields.length*100);
 const checklist=[
  ["Phone number", !!student.phone], ["USN", !!student.usn], ["Department", !!student.department],
  ["Graduation year", !!student.graduationYear], ["CGPA", student.cgpa !== null], ["10th percentage", student.tenthPercentage !== null],
  ["12th percentage", student.twelfthPercentage !== null], ["Resume", !!student.resumeUrl]
 ];
 return <WorkspaceShell role={session.user.role} active="profile">
 <main className="profile-module">
  <div className="profile-hero">
   <div className="profile-identity">
    <div className="profile-avatar-large">{initials(student.user.name)}</div>
    <div><p className="eyebrow">STUDENT PROFILE</p><h1>{student.user.name || "My Profile"}</h1><p>{student.user.email}</p></div>
   </div>
   <div className="profile-actions"><span className={`profile-status ${student.placementStatus.toLowerCase()}`}>{student.placementStatus.replaceAll("_"," ")}</span><Link className="primary" href="/profile/edit">Edit Profile</Link></div>
  </div>

  <section className="profile-completeness panel">
   <div className="profile-completeness-head"><div><span className="section-kicker">PLACEMENT READINESS</span><h2>Profile completeness</h2><p>Complete your profile so eligibility checks and recruiter review have accurate information.</p></div><strong>{complete}%</strong></div>
   <div className="progress-track" aria-label={`Profile completeness ${complete}%`}><div className="progress-fill" style={{width:`${complete}%`}}/></div>
   <div className="profile-checklist">{checklist.map(([label,done])=><div key={String(label)} className={done ? "check-item done" : "check-item"}><span aria-hidden="true">{done ? "✓" : "○"}</span><span>{label}</span></div>)}</div>
  </section>

  <div className="profile-layout">
   <section className="panel profile-details-card"><div className="section-heading"><div><span className="section-kicker">PROFILE INFORMATION</span><h2>Personal & academic details</h2></div><Link className="secondary compact-action" href="/profile/edit">Edit</Link></div>
    <div className="profile-detail-grid">
     <div><span>Full name</span><strong>{student.user.name||"Not added"}</strong></div><div><span>Email</span><strong>{student.user.email}</strong></div>
     <div><span>Phone</span><strong>{student.phone||"Not added"}</strong></div><div><span>USN</span><strong>{student.usn||"Not added"}</strong></div>
     <div><span>Department</span><strong>{student.department||"Not added"}</strong></div><div><span>Graduation year</span><strong>{student.graduationYear||"Not added"}</strong></div>
     <div><span>CGPA</span><strong>{student.cgpa??"Not added"}</strong></div><div><span>Backlogs</span><strong>{student.backlogs}</strong></div>
     <div><span>10th percentage</span><strong>{student.tenthPercentage??"Not added"}</strong></div><div><span>12th percentage</span><strong>{student.twelfthPercentage??"Not added"}</strong></div>
    </div>
   </section>

   <section className="panel resume-panel-refined"><div className="section-heading"><div><span className="section-kicker">RESUME</span><h2>Recruiter-ready document</h2></div></div>
    {student.resumeUrl ? <><div className="resume-ready-refined"><span className="resume-icon">PDF</span><div><strong>Resume linked</strong><p>Recruiters can access the resume attached to your placement profile.</p></div></div><a className="primary full-button" href={student.resumeUrl} target="_blank" rel="noreferrer">Open Resume ↗</a><Link className="secondary full-button" href="/profile/edit">Update Resume Link</Link></> : <div className="resume-empty-refined"><div className="resume-icon">PDF</div><h3>Add your resume</h3><p>A current resume makes your profile ready for recruiter review.</p><Link className="primary full-button" href="/profile/edit">Add Resume</Link></div>}
   </section>
  </div>
 </main>
 </WorkspaceShell>
}
