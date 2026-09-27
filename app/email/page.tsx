import {auth} from "@/auth";
import {redirect} from "next/navigation";
import Link from "next/link";
import EmailComposer from "@/components/email/EmailComposer";
export default async function EmailPage(){
 const s=await auth();if(!s?.user?.id)redirect("/login");if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))redirect("/dashboard");
 return <main className="content"><div className="topbar"><div><p className="eyebrow">COMMUNICATION</p><h1>Email Center</h1><p className="muted">Send placement communications using reusable templates.</p></div><Link className="secondary" href="/notifications">Notifications</Link></div><section className="panel"><EmailComposer/></section><div className="panel email-note"><h2>Provider setup</h2><p>Configure <code>EMAIL_WEBHOOK_URL</code> and optionally <code>EMAIL_FROM</code> in your environment. The webhook can point to your preferred email provider or backend mail service.</p></div></main>
}