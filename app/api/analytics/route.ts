import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function GET(){
 const session=await auth();if(!session?.user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [students,companies,drives,applications,offers,placed,interviews,status,departments,packages]=await Promise.all([
  prisma.student.count(),prisma.company.count(),prisma.placementDrive.count(),prisma.application.count(),
  prisma.offer.count(),prisma.student.count({where:{placementStatus:"PLACED"}}),prisma.interview.count(),
  prisma.application.groupBy({by:["status"],_count:{_all:true}}),
  prisma.student.groupBy({by:["department"],_count:{_all:true}}),
  prisma.offer.findMany({select:{packageLpa:true},where:{packageLpa:{not:null}}})
 ]);
 const values=packages.map(x=>x.packageLpa||0);
 return NextResponse.json({students,companies,drives,applications,offers,placed,interviews,status,departments,averagePackage:values.length?values.reduce((a,b)=>a+b,0)/values.length:0,highestPackage:values.length?Math.max(...values):0});
}
