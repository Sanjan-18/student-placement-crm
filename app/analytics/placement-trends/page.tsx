import {auth} from "@/auth";
import {redirect} from "next/navigation";
import PlacementAnalytics2 from "@/components/analytics/PlacementAnalytics2";

export default async function PlacementTrends(){
 const s=await auth();if(!s?.user?.id)redirect("/login");if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))redirect("/dashboard");
 return <main className="content"><div className="topbar"><div><p className="eyebrow">ANALYTICS 2.0</p><h1>Placement Trends</h1><p className="muted">Department, company, graduation-year and package analytics.</p></div></div><PlacementAnalytics2/></main>
}