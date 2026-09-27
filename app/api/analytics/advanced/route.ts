import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function GET(){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [students,applications,offers,drives,companies]=await Promise.all([
  prisma.student.findMany({select:{department:true,graduationYear:true,placementStatus:true,cgpa:true}}),
  prisma.application.findMany({include:{student:{select:{department:true,graduationYear:true}},drive:{include:{company:true}}}}),
  prisma.offer.findMany({include:{application:{include:{student:{select:{department:true,graduationYear:true}},drive:{include:{company:true}}}}}}),
  prisma.placementDrive.findMany({include:{company:true,applications:true}}),
  prisma.company.findMany({include:{drives:{include:{applications:true}}}})
 ]);
 const deptMap:any={};
 for(const x of students){const k=x.department||"Not specified";deptMap[k]??={department:k,students:0,placed:0,rate:0};deptMap[k].students++;if(x.placementStatus==="PLACED")deptMap[k].placed++}
 Object.values(deptMap).forEach((x:any)=>x.rate=x.students?Math.round(x.placed/x.students*100):0);
 const companyMap:any={};
 for(const c of companies){const apps=c.drives.reduce((n,d)=>n+d.applications.length,0);const selected=c.drives.reduce((n,d)=>n+d.applications.filter(a=>["SELECTED","OFFERED","ACCEPTED"].includes(a.status)).length,0);companyMap[c.id]={company:c.name,applications:apps,selected,conversion:apps?Math.round(selected/apps*100):0,drives:c.drives.length}}
 const packageBuckets={"<4":0,"4-6":0,"6-10":0,"10-15":0,"15+":0};
 for(const o of offers){const p=o.packageLpa||0;const k=p<4?"<4":p<6?"4-6":p<10?"6-10":p<15?"10-15":"15+";packageBuckets[k]++}
 const yearMap:any={};
 for(const x of students){const k=String(x.graduationYear||"Unknown");yearMap[k]??={year:k,students:0,placed:0};yearMap[k].students++;if(x.placementStatus==="PLACED")yearMap[k].placed++}
 return NextResponse.json({
  department:Object.values(deptMap).sort((a:any,b:any)=>b.rate-a.rate),
  companies:Object.values(companyMap).sort((a:any,b:any)=>b.selected-a.selected),
  packages:Object.entries(packageBuckets).map(([range,count])=>({range,count})),
  graduationYears:Object.values(yearMap).sort((a:any,b:any)=>String(a.year).localeCompare(String(b.year))),
  totals:{students:students.length,placed:students.filter(x=>x.placementStatus==="PLACED").length,applications:applications.length,offers:offers.length,drives:drives.length}
 });
}