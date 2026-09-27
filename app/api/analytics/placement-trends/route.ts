import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function GET(){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const students=await prisma.student.findMany({select:{department:true,graduationYear:true,placementStatus:true,applications:{select:{status:true,drive:{select:{company:{select:{name:true}},packageLpa:true}}}}}});
 const dept:Record<string,any>={}, year:Record<string,any>={}, companies:Record<string,any>={}, packages:number[]=[];
 for(const st of students){
  const d=st.department||"Unknown"; const y=String(st.graduationYear||"Unknown");
  dept[d]??={department:d,students:0,placed:0,applications:0,offers:0};dept[d].students++;if(st.placementStatus==="PLACED")dept[d].placed++;
  year[y]??={year:y,students:0,placed:0};year[y].students++;if(st.placementStatus==="PLACED")year[y].placed++;
  for(const a of st.applications){dept[d].applications++;if(["OFFERED","ACCEPTED"].includes(a.status))dept[d].offers++;const c=a.drive.company.name;companies[c]??={company:c,applications:0,offers:0};companies[c].applications++;if(["OFFERED","ACCEPTED"].includes(a.status))companies[c].offers++;}
 }
 const offers=await prisma.offer.findMany({select:{packageLpa:true,status:true}});
 for(const o of offers)if(o.packageLpa)packages.push(o.packageLpa);
 return NextResponse.json({department:Object.values(dept),graduationYear:Object.values(year),companies:Object.values(companies).sort((a:any,b:any)=>b.offers-a.offers).slice(0,12),packages:packages.sort((a,b)=>a-b),summary:{students:students.length,placed:students.filter(x=>x.placementStatus==="PLACED").length,offers:offers.length,averagePackage:packages.length?packages.reduce((a,b)=>a+b,0)/packages.length:0,highestPackage:packages.length?Math.max(...packages):0}});
}