import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import ProfileEditor from "@/components/profile/ProfileEditor";
import Link from "next/link";
import WorkspaceShell from "@/components/layout/WorkspaceShell";

export default async function EditProfile(){
 const session=await auth(); if(!session?.user?.id) redirect("/login");
 const student=await prisma.student.findUnique({where:{userId:session.user.id}, include:{user:true}});
 if(!student) redirect("/dashboard");
 return <WorkspaceShell role={session.user.role} active="profile"><main className="profile-editor-page"><div className="topbar"><div><p className="eyebrow">PROFILE SETTINGS</p><h1>Edit Profile</h1><p className="muted">Update the academic information used for placement eligibility.</p></div><Link className="secondary" href="/profile">Cancel</Link></div><ProfileEditor initial={student}/></main></WorkspaceShell>
}
