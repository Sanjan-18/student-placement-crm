import {auth} from "@/auth";
import {redirect} from "next/navigation";
import Link from "next/link";
import DocumentManager from "@/components/documents/DocumentManager";

export default async function DocumentsPage(){
 const s=await auth();if(!s?.user?.id)redirect("/login");
 if(s.user.role!=="STUDENT")redirect("/dashboard");
 return <main className="content"><div className="topbar"><div><p className="eyebrow">DOCUMENTS</p><h1>My Documents</h1><p className="muted">Upload and manage the documents used during placements.</p></div><Link className="secondary" href="/profile">Profile</Link></div><section className="panel"><DocumentManager/></section></main>
}