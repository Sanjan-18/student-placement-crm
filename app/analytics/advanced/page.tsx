import {auth} from "@/auth";
import {redirect} from "next/navigation";
import Link from "next/link";
import AdvancedAnalytics from "@/components/analytics/AdvancedAnalytics";

export default async function AdvancedAnalyticsPage(){
 const s=await auth();if(!s?.user?.id)redirect("/login");
 return <main className="content"><div className="topbar"><div><p className="eyebrow">ANALYTICS</p><h1>Advanced Placement Analytics</h1><p className="muted">Department, company, package and graduation-year insights.</p></div><Link className="secondary" href="/analytics">Overview</Link></div><AdvancedAnalytics/></main>
}