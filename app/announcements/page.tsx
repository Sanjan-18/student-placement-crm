import {auth} from "@/auth";
import {redirect} from "next/navigation";
import AnnouncementCenter from "@/components/announcements/AnnouncementCenter";

export default async function Announcements(){
 const s=await auth();if(!s?.user?.id)redirect("/login");
 return <main className="content"><div className="topbar"><div><p className="eyebrow">ENGAGEMENT</p><h1>Announcements</h1><p className="muted">View important placement communications.</p></div></div><AnnouncementCenter canBroadcast={["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role)}/></main>
}