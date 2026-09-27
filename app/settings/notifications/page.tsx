import {auth} from "@/auth";
import {redirect} from "next/navigation";
import NotificationPreferences from "@/components/notifications/NotificationPreferences";

export default async function NotificationSettings(){
 const s=await auth();if(!s?.user?.id)redirect("/login");
 return <main className="content"><div className="topbar"><div><p className="eyebrow">SETTINGS</p><h1>Notification Preferences</h1><p className="muted">Choose which placement updates you want to receive.</p></div></div><NotificationPreferences/></main>
}