import {auth} from "@/auth";
import {redirect} from "next/navigation";
import Link from "next/link";

export default async function PlacementReport(){
 const s=await auth();if(!s?.user?.id)redirect("/login");if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))redirect("/dashboard");
 return <main className="content"><div className="topbar"><div><p className="eyebrow">REPORTING</p><h1>Placement Report</h1><p className="muted">Export the current student placement dataset for analysis or submission.</p></div><Link className="primary" href="/api/reports/placement-csv">Download CSV</Link></div><section className="panel"><h2>Included fields</h2><ul><li>Student identity and academic information</li><li>Placement status and application count</li><li>Selected company</li><li>Accepted offer package</li></ul></section></main>
}