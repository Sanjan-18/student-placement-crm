import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function GET(req:Request){
 const s=await auth(); if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const {searchParams}=new URL(req.url); const companyId=searchParams.get("companyId"); const status=searchParams.get("status");
 if(!companyId)return NextResponse.json({error:"companyId is required"},{status:400});
 const applications=await prisma.application.findMany({
  where:{drive:{companyId},...(status?{status:status as any}:{})},
  orderBy:{appliedAt:"desc"},
  include:{student:{include:{user:true,documents:true}},drive:{include:{company:true}},interviews:{orderBy:{scheduledAt:"desc"}},offer:true}
 });
 return NextResponse.json(applications);
}