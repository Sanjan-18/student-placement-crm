import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function GET(){
 const s=await auth();if(!s?.user?.id)return new NextResponse("Unauthorized",{status:401});
 if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))return new NextResponse("Forbidden",{status:403});
 const rows=await prisma.student.findMany({include:{user:true,applications:{include:{drive:{include:{company:true}},offer:true}}},orderBy:{department:"asc"}});
 const esc=(v:any)=>`"${String(v??"").replaceAll('"','""')}"`;
 const out=["Name,Email,USN,Department,Graduation Year,CGPA,Placement Status,Applications,Selected Company,Package LPA"];
 for(const st of rows){
  const accepted=st.applications.find(a=>a.status==="ACCEPTED"||a.offer?.status==="ACCEPTED");
  out.push([st.user.name,st.user.email,st.usn,st.department,st.graduationYear,st.cgpa,st.placementStatus,st.applications.length,accepted?.drive.company.name||"",accepted?.offer?.packageLpa||""].map(esc).join(","));
 }
 return new NextResponse(out.join("\n"),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=placement-report.csv"}});
}